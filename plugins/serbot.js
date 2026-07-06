import { crearSubBot } from "../subbots.js";
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
  command: ["serbot", "code", "jadibot"],
  category: "General",
  description: "Genera un código para vincular tu número como sub-bot. Uso: serbot 50499999999",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const numero = args[0]?.replace(/\D/g, "");

    if (!numero || numero.length < 8) {
      await sock.sendMessage(
        chatId,
        {
          text:
            `❀ *${bold("Escribe el número que quieres vincular")}*\n` +
            `> Con código de país, sin + ni espacios.\n\n` +
            `🍃⃨^᪲  ✿⵿ⳋ \`${estilizar("ejemplo")}\` ち ៸៸ ぃ 🍂ᩨ\n` +
            `> ❄️𝆬ᮬֹּ֢〫ᩙۗ͠𓈃 *serbot* 50499999999\n\n` +
            `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n` +
            `> *${config.creator} ×͜×*`,
        },
        { quoted: msg }
      );
      return;
    }

    await sock.sendMessage(
      chatId,
      { 
        text: `🔄 *${bold("Generando tu sub-bot")}*\n> Espera unos segundos...` 
      },
      { quoted: msg }
    );

    await crearSubBot(numero, context.allPlugins, async (texto) => {
      await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
    });
  },
};