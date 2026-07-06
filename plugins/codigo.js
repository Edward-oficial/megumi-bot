import axios from 'axios';
import { config } from "../config.js";

const API_URL = 'https://dv-edward.onrender.com';
const API_KEY = 'edward';

const MAPA_ESTILO = {
  a: "α", b: "b", c: "c", d: "d", e: "ᧉ", f: "𝖿", g: "g", h: "һ", i: "ꪱ",
  j: "j", k: "k", l: "𝗅", m: "𝗆", n: "𝗇", o: "ᦅ", p: "𝗉", q: "q", r: "ꭇ",
  s: "𝗌", t: "ƚ", u: "𝗎", v: "v", w: "w", x: "x", y: "ᥡ", z: "z",
};

function estilizar(texto) {
  return String(texto)
    .toLowerCase()
    .split("")
    .map((c) => MAPA_ESTILO[c] || c)
    .join("");
}

const MAPA_BOLD = {
  a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶",
  j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿",
  s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
  A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
  J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
  S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
};

function bold(texto) {
  return String(texto)
    .split("")
    .map((c) => MAPA_BOLD[c] || c)
    .join("");
}

export default {
  command: ["crearcodigo", "createcode", "newcode"],
  category: "Owner",
  description: "Crea un código de regalo para la API (solo owner)",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    
    const numeroLimpio = sender.split("@")[0];
    const esOwner = numeroLimpio === config.ownerNumber;

    if (!esOwner) {
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Acceso denegado")}\n` +
              `➮ Solo el ${bold("owner")} puede usar este comando.`
      }, { quoted: msg });
      return;
    }

    if (args.length < 3) {
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("CREAR CÓDIGO")}\n\n` +
              `➮ ${bold("Uso correcto:")}\n` +
              `> ${estilizar("crearcodigo CODIGO solicitudes maxusos")}\n\n` +
              `➮ ${bold("Ejemplo:")}\n` +
              `> crearcodigo AMILCARGIT 500 10`
      }, { quoted: msg });
      return;
    }

    const [code, requests, maxUses] = args;

    try {
      const res = await axios.post(`${API_URL}/api/auth/admin/create-code`, {
        adminKey: API_KEY,
        code: code.toUpperCase(),
        requests: parseInt(requests),
        maxUses: parseInt(maxUses)
      });

      const data = res.data;

      if (!data.status) {
        await sock.sendMessage(chatId, {
          text: `✰ ${bold("Error al crear código")}\n` +
                `➮ ${data.error || "Error desconocido"}`
        }, { quoted: msg });
        return;
      }

      let texto = `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n`;
      texto += `✰ ${bold("CÓDIGO CREADO")} ✰\n`;
      texto += `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n\n`;
      texto += `➮ ${bold("Código")} › ${data.data.code}\n`;
      texto += `➮ ${bold("Solicitudes")} › +${data.data.requests}\n`;
      texto += `➮ ${bold("Máx. usos")} › ${data.data.maxUses}\n`;
      texto += `➮ ${bold("Estado")} › ✅ Activo\n\n`;
      texto += `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n`;
      texto += `> ${bold("Mensaje para compartir enviado abajo")}`;

      await sock.sendMessage(chatId, { text: texto }, { quoted: msg });

      const mensajeCompartir = 
        `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n` +
        `✰ ${bold("CÓDIGO DE REGALO")} ✰\n` +
        `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n\n` +
        `➮ ${bold("Código")} › ${data.data.code}\n` +
        `➮ ${bold("Solicitudes")} › +${data.data.requests}\n` +
        `➮ ${bold("Usos disponibles")} › ${data.data.maxUses}\n\n` +
        `📌 ${bold("¿Cómo canjearlo?")}\n` +
        `➮ 1. Entra al dashboard\n` +
        `➮ 2. Busca "Canjear Código"\n` +
        `➮ 3. Ingresa el código y listo\n\n` +
        `🌐 ${API_URL}/dash\n\n` +
        `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n` +
        `> ${bold("Compártelo antes de que se agote")}\n` +
        `> ${config.creator} ×͜×`;

      await sock.sendMessage(chatId, { text: mensajeCompartir }, { quoted: msg });

    } catch (e) {
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Error al conectar con la API")}\n` +
              `➮ ${e.message || "Error desconocido"}`
      }, { quoted: msg });
    }
  }
};