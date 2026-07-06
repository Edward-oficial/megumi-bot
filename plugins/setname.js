import { config } from "../config.js";
import { actualizarNombreSubBot, obtenerSubBotInfo } from "../subbots.js";

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
  command: ["setname", "cambiarnombre", "name"],
  category: "General",
  description: "Cambia el nombre de tu sub-bot. Uso: setname <nuevo nombre>",
  run: async (sock, msg, args, context) => {
    const { chatId, sender, isSubBot } = context;

    if (!isSubBot) {
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Acción no permitida")}\n` +
              `➮ Este comando solo funciona en un ${bold("sub-bot")}.`
      }, { quoted: msg });
      return;
    }

    const nombreNuevo = args.join(" ").trim();
    if (!nombreNuevo) {
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("SET NAME")}\n\n` +
              `➮ ${bold("Uso correcto:")}\n` +
              `> ${estilizar("setname <nuevo nombre>")}\n\n` +
              `➮ ${bold("Ejemplo:")}\n` +
              `> setname Mi Sub-Bot`
      }, { quoted: msg });
      return;
    }

    try {
      const numero = sender.split("@")[0];
      
      // Cambiar el nombre del bot en WhatsApp
      await sock.updateProfileName(nombreNuevo);
      
      // Guardar el nombre en el registro
      actualizarNombreSubBot(numero, nombreNuevo);
      
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Nombre actualizado")}\n` +
              `➮ Nuevo nombre: ${bold(nombreNuevo)}\n` +
              `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n` +
              `> ${config.creator} ×͜×`
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Error cambiando nombre:", err);
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Error al cambiar el nombre")}\n` +
              `➮ ${err.message || "Intenta de nuevo más tarde."}`
      }, { quoted: msg });
    }
  }
};