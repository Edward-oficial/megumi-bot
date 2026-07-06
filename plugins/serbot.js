import { crearSubBot } from "../subbots.js";

const MAPA_ESTILO = {
  a: "α", b: "ᑲ", c: "ᥴ", d: "ᑯ", e: "ᧉ", f: "𝖿", g: "ɠ", h: "һ", i: "ꪱ",
  j: "ȷ", k: "𝗄", l: "𝗅", m: "𝗆", n: "𝗇", o: "ᦅ", p: "𝗉", q: "𝗊", r: "ꭇ",
  s: "𝗌", t: "ƚ", u: "𝗎", v: "᥎", w: "𝗐", x: "᥊", y: "ᥡ", z: "ƶ",
  A: "Α", B: "ᗷ", C: "ᑕ", D: "ᗪ", E: "ᗴ", F: "𝖥", G: "Ꮐ", H: "Η", I: "ꪱ",
  J: "ᒍ", K: "𝖪", L: "ᒪ", M: "ᗰ", N: "Ν", O: "ᦅ", P: "𝗉", Q: "𝗊", R: "ᖇ",
  S: "𝗌", T: "Ƭ", U: "Ս", V: "ᐯ", W: "᭙", X: "᙭", Y: "Ꭹ", Z: "Ƶ",
};

function estilizar(texto) {
  return String(texto)
    .toLowerCase()
    .split("")
    .map((c) => MAPA_ESTILO[c] || c)
    .join("");
}

function bold(texto) {
  return `*${texto}*`;
}

export default {
  command: ["serbot", "code", "jadibot"],
  category: "General",
  description: "Genera un código para vincular TU número como sub-bot (usa tu propio número automáticamente).",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;

    const numero = sender.split("@")[0].split(":")[0];

    await sock.sendMessage(
      chatId,
      { 
        text: `✰ ${bold("Generando tu sub-bot")}\n` +
              `> ${estilizar("espera unos segundos")}...`
      },
      { quoted: msg }
    );

    await crearSubBot(numero, context.allPlugins, async (texto) => {
      await sock.sendMessage(chatId, { text: texto }, { quoted: msg });
    });
  },
};