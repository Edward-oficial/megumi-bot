import { config } from "../config.js";
import { obtenerSubBotInfo } from "../subbots.js";

const MENU_IMAGE = "https://files.catbox.moe/1farsq.webp";

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
  command: ["menu", "help", "ayuda"],
  category: "General",
  description: "Muestra el menú de comandos ordenado por categorías.",
  noRegister: true,
  run: async (sock, msg, args, context) => {
    const { chatId, sender, allPlugins, isSubBot } = context;

    const categorias = {};
    for (const plugin of allPlugins) {
      const categoria = plugin.category || "Otros";
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push(plugin);
    }
    const nombresCategorias = Object.keys(categorias).sort();

    let texto = "";
    
    const esPrincipal = !isSubBot;
    const tipoBot = esPrincipal ? "𝗉𝗋ᧉ𝗆ꪱ𝗎𝗆" : "𝗌𝗎𝖻-𝖻ᦅƚ";
    
    let nombreBot = config.botName || "Megumi";
    
    if (!esPrincipal) {
      const numero = sender.split("@")[0];
      const info = obtenerSubBotInfo(numero);
      if (info && info.nombre) {
        nombreBot = info.nombre;
      }
    }
    
    texto += `✰ ${bold("𝗕𝗶𝗲𝗻𝘃𝗲𝗻𝗶𝗱𝗼 𝗮𝗹 𝗺𝗲𝗻𝘂")}\n\n`;
    texto += "`ਂ ๋ ݀✰✰ ׅ ۬🅔𝗻𝗹𝗮𝗰𝗲𝘀ׄ ٜ ۬ ় ۬ ׅ ׅ`\n\n";
    texto += `⢷ ❄️᮫᪲  *API › https://dv-edward.onrender.com/*\n\n`;
    texto += "╰  ̇   ꯭̊┉꯭ᩴ  ꯭ ᪲━꯭̊ᩴ┉꯭ꤦ  ̇̊  ꯭ ᩴ─꤫ꤦ  ͜ ᩙ  ̇͜⣾᪲\n";
    texto += "`ਂ ๋ ݀✰✰ ׅ ۬🅘𝗻𝗳𝗼 ٜ ۬ ় ۬ ׅ ׅ`\n\n";
    texto += `⢷ ❄️᮫᪲  *Bot › ${bold(nombreBot)}*\n`;
    texto += `⢷ ❄️᮫᪲  *Prefijo › (ninguno, directo)*\n`;
    texto += `⢷ ❄️᮫᪲  *Tipo › ${bold(tipoBot)}*\n\n`;
    texto += `╾ׄ𖹭ִ╼ᮀ✿ִ╾ᜒ𖹭╼ִ✿╾᩿ׄ𖹭╼ִ✿╾ᮀ𖹭ִ╼ᜒ✿ִ╾ׄ𖹭᩿╼\n`;
    texto += `> *Disfruta de este nuevo proyecto ฅ⁠^⁠•⁠ﻌ⁠•⁠^⁠ฅ*\n`;

    for (const categoria of nombresCategorias) {
      texto += `\n🍃⃨^᪲  ✰⵿ⳋ \`${estilizar(categoria)}\` ち ៸៸ ぃ 🍂ᩨ\n`;

      for (const plugin of categorias[categoria]) {
        texto += `\n❄️𝆬ᮬֹּ֢〫ᩙۗ͠𓈃 ${plugin.command.join(" ")}\n`;
        texto += `> *» ${bold(plugin.description || "Sin descripcion")}*\n`;
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
  }
};