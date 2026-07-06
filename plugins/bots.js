import { listarSubBots } from "../subbots.js";
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
  command: ["bots", "subbots", "listbots"],
  category: "General",
  description: "Muestra la lista de sub-bots conectados",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    
    const subBots = listarSubBots();
    const numeros = Object.keys(subBots);
    
    if (numeros.length === 0) {
      await sock.sendMessage(chatId, {
        text: `📭 *${bold("No hay sub-bots activos")}*\n\n` +
              `> Usa *serbot* para vincular un número`
      }, { quoted: msg });
      return;
    }
    
    let texto = `📱 *${bold("Sub-Bots Conectados")}*\n\n`;
    texto += `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n\n`;
    
    let contador = 1;
    for (const numero of numeros) {
      const info = subBots[numero];
      const estado = info.estado || "conectado";
      const emoji = estado === "conectado" ? "🟢" : "🔴";
      
      texto += `❄️𝆬ᮬֹּ֢〫ᩙۗ͠𓈃 ${bold(`#${contador}`)} ${bold(numero)}\n`;
      texto += `> ${emoji} *Estado:* ${estilizar(estado)}\n`;
      texto += `> 📅 *Conexión:* ${new Date(info.fecha).toLocaleString()}\n`;
      if (info.ultima_actualizacion) {
        texto += `> 🕐 *Última act:* ${new Date(info.ultima_actualizacion).toLocaleString()}\n`;
      }
      texto += `> 📁 *Carpeta:* ${info.carpeta || numero}\n\n`;
      contador++;
    }
    
    texto += `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n`;
    texto += `> *Total:* ${numeros.length} sub-bot${numeros.length > 1 ? 's' : ''} activos\n`;
    texto += `> *${config.creator} ×͜×*`;
    
    await sock.sendMessage(chatId, {
      text: texto
    }, { quoted: msg });
  }
};