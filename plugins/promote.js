export default {
  command: ["promote", "ascender"],
  category: "Grupo",
  description: "Asciende a un miembro a administrador.",
  groupOnly: true,
  adminOnly: true,
  requiereBotAdmin: true,

  run: async (sock, msg, args, context) => {
    const { chatId, participantes } = context;

    let usuario;

    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      usuario = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      usuario = msg.message.extendedTextMessage.contextInfo.participant;
    } else if (args[0]) {
      usuario = args[0].replace(/\D/g, "") + "@s.whatsapp.net";
    }

    if (!usuario) {
      return sock.sendMessage(
        chatId,
        {
          text: "❀ Menciona, responde el mensaje o escribe el número del usuario que deseas ascender.",
        },
        { quoted: msg }
      );
    }

    const miembro = participantes.find((p) => p.id === usuario);

    if (!miembro) {
      return sock.sendMessage(
        chatId,
        {
          text: "❌ Ese usuario no pertenece al grupo.",
        },
        { quoted: msg }
      );
    }

    if (miembro.admin) {
      return sock.sendMessage(
        chatId,
        {
          text: "⚠️ Ese usuario ya es administrador.",
        },
        { quoted: msg }
      );
    }

    try {
      await sock.groupParticipantsUpdate(chatId, [usuario], "promote");

      await sock.sendMessage(
        chatId,
        {
          text: `✅ @${usuario.split("@")[0]} ha sido ascendido a administrador.`,
          mentions: [usuario],
        },
        { quoted: msg }
      );
    } catch {
      await sock.sendMessage(
        chatId,
        {
          text: "❌ No pude ascender al usuario. Verifica que el bot tenga permisos de administrador.",
        },
        { quoted: msg }
      );
    }
  },
};