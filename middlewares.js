import fs from "fs";
import path from "path";
import { config } from "./config.js";

const DB_PATH = "./database/usuarios.json";

function asegurarDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

export function cargarUsuarios() {
  asegurarDB();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

export function guardarUsuarios(usuarios) {
  asegurarDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(usuarios, null, 2));
}

export function estaRegistrado(numero) {
  const usuarios = cargarUsuarios();
  return !!usuarios[numero];
}

export function registrarUsuario(numero, datos) {
  const usuarios = cargarUsuarios();
  usuarios[numero] = { ...datos, fecha: new Date().toISOString() };
  guardarUsuarios(usuarios);
}

export function obtenerUsuario(numero) {
  const usuarios = cargarUsuarios();
  return usuarios[numero] || null;
}

export function esOwner(numero) {
  return numero === config.ownerNumber;
}

export async function pasaFiltros(sock, msg, plugin, context) {
  const { chatId, sender } = context;
  const numero = sender.split("@")[0];
  const esGrupo = chatId.endsWith("@g.us");

  if (plugin.ownerOnly && !esOwner(numero)) {
    await sock.sendMessage(
      chatId,
      { text: "❀ Este comando es exclusivo del *creador* del bot." },
      { quoted: msg }
    );
    return false;
  }

  if (plugin.groupOnly && !esGrupo) {
    await sock.sendMessage(
      chatId,
      { text: "❀ Este comando solo se puede usar *dentro de un grupo*." },
      { quoted: msg }
    );
    return false;
  }

  if (plugin.privateOnly && esGrupo) {
    await sock.sendMessage(
      chatId,
      { text: "❀ Este comando solo se puede usar *en privado*, no en grupos." },
      { quoted: msg }
    );
    return false;
  }

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
        const participante = metadata.participants.find((p) => p.id === sender);
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

  if (!plugin.noRegister && !esOwner(numero) && !estaRegistrado(numero)) {
    await sock.sendMessage(
      chatId,
      {
        text:
          "❀ Necesitas *registrarte* antes de usar comandos.\n\n" +
          "Escribe: *register Tu Nombre,Tu Edad*\nEjemplo: register Edward,20",
      },
      { quoted: msg }
    );
    return false;
  }

  return true;
}