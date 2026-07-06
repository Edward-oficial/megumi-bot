import axios from 'axios';
import { config } from "../config.js";

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
  command: ["kiss", "beso", "besar"],
  category: "Anime",
  description: "Envía un GIF de un beso anime",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;

    let who = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
              msg.message?.extendedTextMessage?.contextInfo?.participant || 
              sender;
    
    let name = '@' + who.split('@')[0];

    try {
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Buscando un beso anime")}...\n` +
              `➮ ⏳ Espera un momento...`
      }, { quoted: msg });

      const res = await axios.get('https://api.delirius.store/reactions/kiss');
      const json = res.data;

      if (!json.status || !json.data?.url) {
        await sock.sendMessage(chatId, {
          text: `✰ ${bold("No encontré un beso")}\n` +
                `➮ Intenta de nuevo más tarde.`
        }, { quoted: msg });
        return;
      }

      const caption = `✰ ${bold("KISS")}\n` +
                      `➮ ${bold("Para:")} ${name}\n` +
                      `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼`;

      await sock.sendMessage(chatId, {
        video: { url: json.data.url },
        mimetype: "video/mp4",
        caption: caption,
        mentions: [who]
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Error en el comando kiss:", err);
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Ocurrió un error")}\n` +
              `➮ Buscando el beso anime.`
      }, { quoted: msg });
    }
  }
};