import fs from "fs";
import path from "path";
import chalk from "chalk";
import { crearBot } from "./core.js";

const SUBBOTS_DIR = "./session/subbots";
const subBotsActivos = new Map();

export function listarSubBots() {
  const registroPath = path.join(SUBBOTS_DIR, "subbots_registrados.json");
  if (fs.existsSync(registroPath)) {
    const registros = JSON.parse(fs.readFileSync(registroPath, "utf-8"));
    const activos = {};
    for (const [numero, info] of Object.entries(registros)) {
      if (info.activo !== false) {
        activos[numero] = info;
      }
    }
    return activos;
  }
  return {};
}

function registrarSubBot(numero, carpetaSesion) {
  const registroPath = path.join(SUBBOTS_DIR, "subbots_registrados.json");
  let registros = {};
  
  if (fs.existsSync(registroPath)) {
    registros = JSON.parse(fs.readFileSync(registroPath, "utf-8"));
  }
  
  registros[numero] = {
    carpeta: carpetaSesion,
    fecha: new Date().toISOString(),
    activo: true,
    estado: "conectado"
  };
  
  fs.writeFileSync(registroPath, JSON.stringify(registros, null, 2));
}

export async function crearSubBot(numero, plugins, avisar) {
  const numeroLimpio = numero.replace(/\D/g, "");

  if (subBotsActivos.has(numeroLimpio)) {
    await avisar("✰ Ese número ya tiene un sub-bot activo.");
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
      isSubBot: true,
      onPairingCode: async (code) => {
        await avisar(
          `✅ Tu código de vinculación es: *${code}*\n\n` +
            "Ve a WhatsApp > Dispositivos vinculados > Vincular con número de teléfono, e ingresa el código."
        );
      },
      onReady: async () => {
        await avisar("✰ Tu sub-bot ya está conectado y funcionando con todos los comandos.");
        registrarSubBot(numeroLimpio, sessionFolder);
      },
    });

    subBotsActivos.set(numeroLimpio, sock);
  } catch (err) {
    console.log(chalk.red("❌ Error creando sub-bot:"), err);
    await avisar("✰ Ocurrió un error generando tu sub-bot, intenta de nuevo.");
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
        isSubBot: true,
      });
      subBotsActivos.set(numero, sock);
      console.log(chalk.magenta(`🔄 Sub-bot reconectado: ${numero}`));
      
      const registroPath = path.join(SUBBOTS_DIR, "subbots_registrados.json");
      if (fs.existsSync(registroPath)) {
        const registros = JSON.parse(fs.readFileSync(registroPath, "utf-8"));
        if (registros[numero]) {
          registros[numero].activo = true;
          registros[numero].estado = "conectado";
          registros[numero].ultima_actualizacion = new Date().toISOString();
          fs.writeFileSync(registroPath, JSON.stringify(registros, null, 2));
        }
      }
    } catch (err) {
      console.log(chalk.red(`❌ Error reconectando sub-bot ${numero}:`), err);
    }
  }
}