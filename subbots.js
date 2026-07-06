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

export function obtenerSubBotInfo(numero) {
  const registroPath = path.join(SUBBOTS_DIR, "subbots_registrados.json");
  if (fs.existsSync(registroPath)) {
    const registros = JSON.parse(fs.readFileSync(registroPath, "utf-8"));
    return registros[numero] || null;
  }
  return null;
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
    estado: "conectado",
    nombre: `Sub-Bot ${numero}`
  };
  
  fs.writeFileSync(registroPath, JSON.stringify(registros, null, 2));
}

export function actualizarNombreSubBot(numero, nuevoNombre) {
  const registroPath = path.join(SUBBOTS_DIR, "subbots_registrados.json");
  if (fs.existsSync(registroPath)) {
    const registros = JSON.parse(fs.readFileSync(registroPath, "utf-8"));
    if (registros[numero]) {
      registros[numero].nombre = nuevoNombre;
      fs.writeFileSync(registroPath, JSON.stringify(registros, null, 2));
      return true;
    }
  }
  return false;
}

function eliminarSubBotCompleto(sessionFolder) {
  const numero = path.basename(sessionFolder);
  console.log(chalk.yellow(`🗑️ Eliminando sub-bot: ${numero}`));
  
  if (fs.existsSync(sessionFolder)) {
    fs.rmSync(sessionFolder, { recursive: true, force: true });
    console.log(chalk.green(`✅ Carpeta eliminada: ${sessionFolder}`));
  }
  
  const registroPath = path.join(SUBBOTS_DIR, "subbots_registrados.json");
  if (fs.existsSync(registroPath)) {
    const registros = JSON.parse(fs.readFileSync(registroPath, "utf-8"));
    delete registros[numero];
    fs.writeFileSync(registroPath, JSON.stringify(registros, null, 2));
  }
  
  if (subBotsActivos.has(numero)) {
    subBotsActivos.delete(numero);
  }
  
  console.log(chalk.green(`✅ Sub-bot ${numero} eliminado completamente`));
}

function eliminarSesionSubBot(numero) {
  const sessionFolder = path.join(SUBBOTS_DIR, numero);
  if (fs.existsSync(sessionFolder)) {
    fs.rmSync(sessionFolder, { recursive: true, force: true });
    console.log(chalk.yellow(`🗑️ Sesión eliminada para: ${numero}`));
  }
  
  const registroPath = path.join(SUBBOTS_DIR, "subbots_registrados.json");
  if (fs.existsSync(registroPath)) {
    const registros = JSON.parse(fs.readFileSync(registroPath, "utf-8"));
    delete registros[numero];
    fs.writeFileSync(registroPath, JSON.stringify(registros, null, 2));
  }
}

export async function crearSubBot(numero, plugins, avisar) {
  const numeroLimpio = numero.replace(/\D/g, "");

  if (subBotsActivos.has(numeroLimpio)) {
    await avisar("✰ Ese número ya tiene un sub-bot activo.");
    return;
  }

  const sessionFolder = path.join(SUBBOTS_DIR, numeroLimpio);
  
  if (fs.existsSync(sessionFolder)) {
    fs.rmSync(sessionFolder, { recursive: true, force: true });
  }
  
  fs.mkdirSync(sessionFolder, { recursive: true });

  let vinculado = false;
  let timeoutId = null;

  try {
    const sock = await crearBot({
      sessionFolder,
      plugins,
      etiqueta: `SUBBOT-${numeroLimpio}`,
      numeroParaPairing: numeroLimpio,
      isSubBot: true,
      onDisconnect: eliminarSubBotCompleto,
      onPairingCode: async (code) => {
        await avisar(
          `✅ Tu código de vinculación es: *${code}*\n\n` +
          "Ve a WhatsApp > Dispositivos vinculados > Vincular con número de teléfono, e ingresa el código.\n\n" +
          "⏳ Tienes 1 minuto para vincular, si no la sesión será eliminada."
        );
        
        timeoutId = setTimeout(() => {
          if (!vinculado) {
            eliminarSesionSubBot(numeroLimpio);
            avisar("⏰ Tiempo agotado. La sesión ha sido eliminada. Vuelve a intentarlo.");
          }
        }, 60000);
      },
      onReady: async () => {
        vinculado = true;
        if (timeoutId) clearTimeout(timeoutId);
        await avisar(`✰ Tu sub-bot *${numeroLimpio}* ya está conectado y funcionando.`);
        registrarSubBot(numeroLimpio, sessionFolder);
      },
    });

    subBotsActivos.set(numeroLimpio, sock);
  } catch (err) {
    console.log(chalk.red("❌ Error creando sub-bot:"), err);
    await avisar("✰ Ocurrió un error generando tu sub-bot, intenta de nuevo.");
    eliminarSesionSubBot(numeroLimpio);
  }
}

export async function reconectarSubBots(plugins) {
  console.log(chalk.yellow(`ℹ️ Los sub-bots se eliminan automáticamente al desconectarse`));
  return;
}