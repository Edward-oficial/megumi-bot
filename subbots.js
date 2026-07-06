import fs from "fs";
import path from "path";
import chalk from "chalk";
import { crearBot } from "./core.js";

const SUBBOTS_DIR = "./session/subbots";
const subBotsActivos = new Map();

export async function crearSubBot(numero, plugins, avisar) {
  const numeroLimpio = numero.replace(/\D/g, "");

  if (subBotsActivos.has(numeroLimpio)) {
    await avisar("❀ Ese número ya tiene un sub-bot activo.");
    return;
  }

  const sessionFolder = path.join(SUBBOTS_DIR, numeroLimpio);
  fs.mkdirSync(sessionFolder, { recursive: true });

  try {
    const sock = await crearBot({
      sessionFolder,
      plugins,
      etiqueta: `SUBBOT-${numeroLimpio}`,
      numeroParaPairing: numeroLimpio,
      onPairingCode: async (code) => {
        await avisar(
          `✅ Tu código de vinculación es: *${code}*\n\n` +
            "Ve a WhatsApp > Dispositivos vinculados > Vincular con número de teléfono, e ingresa el código."
        );
      },
      onReady: async () => {
        await avisar("🌑 Tu sub-bot ya está conectado y funcionando con todos los comandos.");
      },
    });

    subBotsActivos.set(numeroLimpio, sock);
  } catch (err) {
    console.log(chalk.red("❌ Error creando sub-bot:"), err);
    await avisar("❌ Ocurrió un error generando tu sub-bot, intenta de nuevo.");
  }
}

export async function reconectarSubBots(plugins) {
  if (!fs.existsSync(SUBBOTS_DIR)) return;

  const carpetas = fs.readdirSync(SUBBOTS_DIR);

  for (const numero of carpetas) {
    const sessionFolder = path.join(SUBBOTS_DIR, numero);
    const credsPath = path.join(sessionFolder, "creds.json");
    if (!fs.existsSync(credsPath)) continue;

    try {
      const sock = await crearBot({
        sessionFolder,
        plugins,
        etiqueta: `SUBBOT-${numero}`,
      });
      subBotsActivos.set(numero, sock);
      console.log(chalk.magenta(`🔄 Sub-bot reconectado: ${numero}`));
    } catch (err) {
      console.log(chalk.red(`❌ Error reconectando sub-bot ${numero}:`), err);
    }
  }
}