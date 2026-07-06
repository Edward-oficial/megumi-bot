import { config } from "../config.js";

const MENU_IMAGE = "https://files.catbox.moe/1farsq.webp";

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
  command: ["menu", "help", "ayuda"],
  category: "General",
  description: "Muestra el menú de comandos ordenado por categorías.",
  noRegister: true,
  run: async (sock, msg, args, context) => {
    const { chatId, sender, allPlugins } = context;

    const categorias = {};
    for (const plugin of allPlugins) {
      const categoria = plugin.category || "Otros";
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push(plugin);
    }
    const nombresCategorias = Object.keys(categorias).sort();

    let texto = "";
    texto += `ツ${config.creator}×͜× *${bold("Bienvenido a mi menu completo")}*\n\n`;

    texto += "`ਂ ๋ ݀✰✰ ׅ ۬🅘𝗻𝗳𝗼 ٜ ۬ ় ۬ ׅ ׅ`\n\n";
    texto += `花 ⢷ 🌑᮫᪲  *Bot › ${config.botName}*\n`;
    texto += `花 ⢷ 🌑᮫᪲  *Prefijo › (ninguno, directo)*\n`;
    texto += `花 ⢷ 🌑᮫᪲  *Creador › ${config.creator}*\n\n`;

    texto += "╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n";
    texto += "> *Disfruta de este nuevo proyecto ฅ⁠^⁠•⁠ﻌ⁠•⁠^⁠ฅ*\n";

    for (const categoria of nombresCategorias) {
      texto += `\n🍃⃨^᪲  ✿⵿ⳋ \`${estilizar(categoria)}\` ち ៸៸ ぃ 🍂ᩨ\n`;

      for (const plugin of categorias[categoria]) {
        texto += `\n❄️𝆬ᮬֹּ֢〫ᩙۗ͠𓈃 ${plugin.command.join(" ")}\n`;
        texto += `> *» ${plugin.description || "Sin descripción"}*\n`;
      }
    }

    await sock.sendMessage(
      chatId,
      {
        image: { url: MENU_IMAGE },
        caption: texto,
        mentions: [sender],
      },
      { quoted: msg }
    );
  },
};