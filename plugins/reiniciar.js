import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const OWNER_NUMBER = "59177474230";
const PROCESS_NAME = "megumi"; // Cambia esto por el nombre de tu proceso en PM2

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
  command: ["reiniciar", "restart", "reboot"],
  category: "Owner",
  description: "Reinicia el bot con PM2 (solo owner)",
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    
    const numero = sender.split("@")[0];
    
    if (numero !== OWNER_NUMBER) {
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Acceso denegado")}\n` +
              `> ${estilizar("solo el owner puede usar este comando")}`
      }, { quoted: msg });
      return;
    }

    await sock.sendMessage(chatId, {
      text: `✰ ${bold("Reiniciando el bot")}\n` +
            `> ${estilizar("el bot se reiniciará con PM2")}...`
    }, { quoted: msg });

    try {
      // Reiniciar con PM2
      await execAsync(`pm2 restart ${PROCESS_NAME}`);
      
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Bot reiniciado")}\n` +
              `> ${estilizar("el bot se ha reiniciado correctamente")}`
      }, { quoted: msg });
    } catch (err) {
      console.log("❌ Error en reiniciar:", err);
      await sock.sendMessage(chatId, {
        text: `✰ ${bold("Error al reiniciar")}\n` +
              `> ${estilizar(err.message || "intenta de nuevo")}`
      }, { quoted: msg });
    }
  }
};