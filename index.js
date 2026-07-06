import readline from "readline";
import chalk from "chalk";
import fs from "fs";

import { config } from "./config.js";
import { loadPlugins } from "./pluginLoader.js";
import { crearBot } from "./core.js";
import { reconectarSubBots } from "./subbots.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) =>
  new Promise((resolve) => rl.question(text, resolve));

async function iniciar() {
  console.log(
    chalk.cyanBright(`
❀════════════════════════════❀
      ${config.botName.toUpperCase()} BOT — Creador: ${config.creator}
❀════════════════════════════❀
`)
  );

  const plugins = await loadPlugins();

  const usePairingCode = !fs.existsSync(`${config.sessionFolder}/creds.json`);
  let numeroParaPairing = null;
  let mostrarQR = false;

  if (usePairingCode) {
    const metodo = await question(
      chalk.yellow(
        "\n¿Cómo quieres vincular a Megumi?\n1) Código de 8 dígitos\n2) Código QR\nElige 1 o 2: "
      )
    );

    if (metodo.trim() === "1") {
      numeroParaPairing = await question(
        chalk.yellow(
          "\nEscribe tu número de WhatsApp con código de país (sin + ni espacios). Ej: 50499999999\nNúmero: "
        )
      );
    } else {
      mostrarQR = true;
      console.log(
        chalk.yellow(
          "\nEscanea el código QR que aparecerá abajo con WhatsApp > Dispositivos vinculados.\n"
        )
      );
    }
  }

  await crearBot({
    sessionFolder: config.sessionFolder,
    plugins,
    etiqueta: "MEGUMI",
    mostrarQR,
    numeroParaPairing,
    onPairingCode: (code) => {
      console.log(
        chalk.greenBright(`\n✅ Tu código de vinculación es: `) +
          chalk.bold.white(code)
      );
      console.log(
        chalk.gray(
          "Ve a WhatsApp > Dispositivos vinculados > Vincular con número de teléfono, e ingresa el código.\n"
        )
      );
    },
    onReady: async () => {
      console.log(
        chalk.greenBright(
          `\n🌑 ${config.botName} conectada correctamente. ¡Lista para trabajar!\n`
        )
      );
      await reconectarSubBots(plugins);
    },
  });
}

iniciar();