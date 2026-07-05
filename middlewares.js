import { config } from "./config.js";

export function esOwner(numero) {
  return numero === config.ownerNumber;
}

/**
 * Verifica si el propio bot es administrador del grupo.
 */
export async function botEsAdmin(sock, chatId) {
  const metadata = await sock.groupMetadata(chatId);
  const botNumero = sock.user.id.split(":")[0];
  const participante = metadata.participants.find((p) =>
    p.id.startsWith(botNumero)
  );
  return (
    participante?.admin === "admin" || participante?.admin === "superadmin"
  );
}

/**
 * Corre todos los filtros/detectores antes de ejecutar un plugin.
 * Cada plugin puede declarar estas propiedades opcionales:
 *   ownerOnly: true         -> solo el creador puede usarlo
 *   groupOnly: true         -> solo funciona dentro de grupos
 *   privateOnly: true       -> solo funciona en chat privado
 *   adminOnly: true         -> solo admins del grupo (el owner del bot siempre pasa)
 *   requiereBotAdmin: true  -> el bot debe ser admin del grupo
 *
 * Retorna true si puede continuar, false si fue bloqueado
 * (el aviso correspondiente ya se envió al chat).
 */
export async function pasaFiltros(sock, msg, plugin, context) {
  const { chatId, sender } = context;
  const numero = sender.split("@")[0].split(":")[0];
  const esGrupo = chatId.endsWith("@g.us");

  // 1. Comando exclusivo del owner
  if (plugin.ownerOnly && !esOwner(numero)) {
    await sock.sendMessage(
      chatId,
      { text: "❀ Este comando es exclusivo del *creador* del bot." },
      { quoted: msg }
    );
    return false;
  }

  // 2. Comando solo para grupos
  if (plugin.groupOnly && !esGrupo) {
    await sock.sendMessage(
      chatId,
      { text: "❀ Este comando solo se puede usar *dentro de un grupo*." },
      { quoted: msg }
    );
    return false;
  }

  // 3. Comando solo para chat privado
  if (plugin.privateOnly && esGrupo) {
    await sock.sendMessage(
      chatId,
      { text: "❀ Este comando solo se puede usar *en privado*, no en grupos." },
      { quoted: msg }
    );
    return false;
  }

  // 4. Comando exclusivo de administradores del grupo
  if (plugin.adminOnly) {
    if (!esGrupo) {
      await sock.sendMessage(
        chatId,
        { text: "❀ Este comando solo se puede usar *dentro de un grupo*." },
        { quoted: msg }
      );
      return false;
    }

    if (!esOwner(numero)) {
      try {
        const metadata = await sock.groupMetadata(chatId);

        let numeroLid = null;
        try {
          const lidJid = await sock.signalRepository?.lidMapping?.getLIDForPN(
            sender
          );
          if (lidJid) numeroLid = lidJid.split("@")[0].split(":")[0];
        } catch (_) {}

        const participante = metadata.participants.find((p) => {
          const idLimpio = p.id.split("@")[0].split(":")[0];
          return idLimpio === numero || (numeroLid && idLimpio === numeroLid);
        });

        const esAdmin =
          participante?.admin === "admin" || participante?.admin === "superadmin";

        if (!esAdmin) {
          await sock.sendMessage(
            chatId,
            { text: "❀ Este comando es solo para *administradores* del grupo." },
            { quoted: msg }
          );
          return false;
        }
      } catch (err) {
        await sock.sendMessage(
          chatId,
          { text: "❌ No pude verificar los admins del grupo, intenta de nuevo." },
          { quoted: msg }
        );
        return false;
      }
    }
  }

  // 5. El bot debe ser admin del grupo
  if (plugin.requiereBotAdmin && esGrupo) {
    try {
      const botAdmin = await botEsAdmin(sock, chatId);
      if (!botAdmin) {
        await sock.sendMessage(
          chatId,
          {
            text:
              "❀ Necesito ser *administrador* del grupo para poder hacer esto.\n" +
              "Hazme admin y vuelve a intentarlo.",
          },
          { quoted: msg }
        );
        return false;
      }
    } catch (err) {
      await sock.sendMessage(
        chatId,
        { text: "❌ No pude verificar si soy admin del grupo." },
        { quoted: msg }
      );
      return false;
    }
  }

  return true;
}