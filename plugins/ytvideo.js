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
  command: ["ytvideo", "ytv", "video"],
  category: "Descargas",
  description: "Descarga un video de YouTube. Uso: ytvideo <nombre o url>",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const query = args.join(" ").trim();

    if (!query) {
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Escribe el nombre o URL del video")}\n\n` +
              `🍃⃨^᪲  ✿⵿ⳋ ${estilizar("ejemplo")} ち ៸៸ ぃ 🍂ᩨ\n` +
              `➮ ✰ ${bold("ytvideo")} shape of you\n` +
              `➮ ✰ ${bold("ytvideo")} https://youtu.be/5M_n2UCe7DQ\n\n` +
              `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n` +
              `> ${config.creator} ×͜×`
      }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(chatId, {
        text: `🔎 ${bold("Buscando")} ${bold(query)}...\n` +
              `➮ ⏳ Espera un momento...`
      }, { quoted: msg });

      // Determinar si es URL o búsqueda
      let videoUrl = query;
      let videoId = null;
      
      const urlPattern = /(youtu\.be\/|youtube\.com\/watch\?v=)([^&\s]+)/;
      const match = query.match(urlPattern);
      
      if (match) {
        videoId = match[2];
        videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      } else {
        // Buscar en YouTube
        const searchRes = await axios.get(`https://api.delirius.store/search/ytsearch?q=${encodeURIComponent(query)}`);
        const searchData = searchRes.data;
        
        if (!searchData.status || !searchData.data || searchData.data.length === 0) {
          await sock.sendMessage(chatId, {
            text: `✰ ${bold("No encontré resultados")}\n` +
                  `➮ Para: ${bold(query)}`
          }, { quoted: msg });
          return;
        }

        const primerVideo = searchData.data[0];
        videoId = primerVideo.videoId;
        videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      }

      // Descargar video
      const downloadRes = await axios.get(`https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(videoUrl)}&format=360p`);
      const downloadData = downloadRes.data;

      if (!downloadData.status || !downloadData.data || !downloadData.data.download) {
        await sock.sendMessage(chatId, {
          text: `✰ ${bold("No pude obtener el video")}\n` +
                `➮ Intenta con otro video.`
        }, { quoted: msg });
        return;
      }

      const info = downloadData.data;
      const titulo = info.title || query;
      const autor = info.author || "Desconocido";
      const vistas = info.views || "0";
      const likes = info.likes || "0";
      const formato = info.format || "360p";

      // Enviar información y video
      if (info.image) {
        await sock.sendMessage(chatId, {
          image: { url: info.image },
          caption: `✰ ${bold(titulo)}\n` +
                   `➮ ${bold("Autor")} › ${autor}\n` +
                   `➮ ${bold("Vistas")} › ${vistas}\n` +
                   `➮ ${bold("Likes")} › ${likes}\n` +
                   `➮ ${bold("Formato")} › ${formato}\n\n` +
                   `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n` +
                   `> ${bold("Enviando video...")}`
        }, { quoted: msg });
      }

      await sock.sendMessage(chatId, {
        video: { url: info.download },
        mimetype: "video/mp4",
        caption: `✰ ${bold(titulo)}\n` +
                 `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n` +
                 `> ${config.creator} ×͜×`
      }, { quoted: msg });

    } catch (err) {
      console.log("❌ Error en ytvideo:", err);
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Ocurrió un error")}\n` +
              `➮ ${err.message || "Buscando o descargando el video."}`
      }, { quoted: msg });
    }
  }
};