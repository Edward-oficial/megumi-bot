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

export function esOwner(numero) {
  return config.ownerNumber?.includes(numero);
}

export async function pasaFiltros(sock, msg, plugin, context) {
  const { chatId, sender } = context;

  const numero = sender.split("@")[0];
  const esGrupo = chatId.endsWith("@g.us");

  const metadata = esGrupo ? await sock.groupMetadata(chatId).catch(() => null) : null;

  const participantes = metadata?.participants || [];

  const senderData = participantes.find(p => p.id === sender);

  const isAdmin =
    senderData?.admin === "admin" ||
    senderData?.admin === "superadmin";

  const botId = sock.user?.id;
  const botData = participantes.find(p => p.id === botId);

  const isBotAdmin =
    botData?.admin === "admin" ||
    botData?.admin === "superadmin";

  const owner = esOwner(numero);

  // OWNER
  if (plugin.ownerOnly && !owner) {
    await sock.sendMessage(chatId, {
      text: "❀ Este comando es solo del *creador* del bot.",
    }, { quoted: msg });
    return false;
  }

  // GROUP ONLY
  if (plugin.groupOnly && !esGrupo) {
    await sock.sendMessage(chatId, {
      text: "❀ Este comando solo funciona en *grupos*.",
    }, { quoted: msg });
    return false;
  }

  // PRIVATE ONLY
  if (plugin.privateOnly && esGrupo) {
    await sock.sendMessage(chatId, {
      text: "❀ Este comando solo funciona en *privado*.",
    }, { quoted: msg });
    return false;
  }

  // ADMIN ONLY
  if (plugin.adminOnly) {
    if (!esGrupo) {
      await sock.sendMessage(chatId, {
        text: "❀ Este comando solo funciona en grupos.",
      }, { quoted: msg });
      return false;
    }

    if (!owner && !isAdmin) {
      await sock.sendMessage(chatId, {
        text: "❀ Solo *admins* pueden usar este comando.",
      }, { quoted: msg });
      return false;
    }

    if (!isBotAdmin) {
      await sock.sendMessage(chatId, {
        text: "❌ Necesito ser *admin* para ejecutar esto.",
      }, { quoted: msg });
      return false;
    }
  }

  // REGISTER
  if (!plugin.noRegister && !owner && !estaRegistrado(numero)) {
    await sock.sendMessage(chatId, {
      text:
        "❀ Necesitas registrarte.\n\n" +
        "Ejemplo:\n*register Edward,20*",
    }, { quoted: msg });

    return false;
  }

  return true;
}