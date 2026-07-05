import baileysPkg from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import readline from "readline";
import pino from "pino";
import chalk from "chalk";
import fs from "fs";

import { config } from "./config.js";
import { loadPlugins } from "./pluginLoader.js";
import { pasaFiltros, esAdminDeGrupo } from "./middlewares.js";
import { obtenerConfigGrupo } from "./groupSettings.js";

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
} = baileysPkg;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) =>
  new Promise((resolve) => rl.question(text, resolve));

let plugins = [];

async function startMegumi() {
  console.log(
    chalk.cyanBright(`
❀════════════════════════════❀
      ${config.botName.toUpperCase()} BOT — Creador: ${config.creator}
❀════════════════════════════❀
`)
  );

  plugins = await loadPlugins();

  const { state, saveCreds } = await useMultiFileAuthState(
    config.sessionFolder
  );
  const { version } = await fetchLatestBaileysVersion();

  const usePairingCode = !fs.existsSync(
    `${config.sessionFolder}/creds.json`
  );

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: !usePairingCode ? true : false,
    browser: Browsers.ubuntu("Chrome"),
    logger: pino({ level: "silent" }),
    syncFullHistory: false,
  });

  // ── Newsletter global en todos los mensajes enviados ─────────
  const enviarOriginal = sock.sendMessage.bind(sock);
  sock.sendMessage = (jid, content, options = {}) => {
    const newsletterContext = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363407253203904@newsletter",
        newsletterName: config.botName,
        serverMessageId: 143,
      },
    };

    const contentConContexto = {
      ...content,
      contextInfo: {
        ...(content?.contextInfo || {}),
        ...newsletterContext,
      },
    };

    return enviarOriginal(jid, contentConContexto, options);
  };

  // ── Selección de método de vinculación ──────────────────────
  if (usePairingCode) {
    const metodo = await question(
      chalk.yellow(
        "\n¿Cómo quieres vincular a Megumi?\n1) Código de 8 dígitos\n2) Código QR\nElige 1 o 2: "
      )
    );

    if (metodo.trim() === "1") {
      const numero = await question(
        chalk.yellow(
          "\nEscribe tu número de WhatsApp con código de país (sin + ni espacios). Ej: 50499999999\nNúmero: "
        )
      );

      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(numero.trim());
          console.log(
            chalk.greenBright(
              `\n✅ Tu código de vinculación es: `
            ) + chalk.bold.white(code)
          );
          console.log(
            chalk.gray(
              "Ve a WhatsApp > Dispositivos vinculados > Vincular con número de teléfono, e ingresa el código.\n"
            )
          );
        } catch (err) {
          console.log(chalk.red("❌ Error solicitando el código de vinculación:"), err);
        }
      }, 3000);
    } else {
      console.log(
        chalk.yellow(
          "\nEscanea el código QR que aparecerá arriba con WhatsApp > Dispositivos vinculados.\n"
        )
      );
    }
  }

  // ── Eventos de conexión ──────────────────────────────────────
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(
        chalk.red(
          `⚠️  Conexión cerrada. ${
            shouldReconnect ? "Reconectando..." : "Sesión cerrada, borra la carpeta 'session' para reiniciar."
          }`
        )
      );

      if (shouldReconnect) startMegumi();
    } else if (connection === "open") {
      console.log(
        chalk.greenBright(
          `\n🌸 ${config.botName} conectada correctamente. ¡Lista para trabajar!\n`
        )
      );
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ── Bienvenida y despedida ────────────────────────────────────
  sock.ev.on("group-participants.update", async (update) => {
    const { id: chatId, participants, action } = update;

    try {
      const configGrupo = obtenerConfigGrupo(chatId);
      if (!configGrupo.welcome) return;

      const metadata = await sock.groupMetadata(chatId);
      const nombreGrupo = metadata.subject;

      for (const participante of participants) {
        const numero = participante.split("@")[0].split(":")[0];

        if (action === "add") {
          await sock.sendMessage(chatId, {
            text:
              `🌸 ¡Bienvenido/a @${numero} a *${nombreGrupo}*!\n` +
              `Esperamos que la pases increíble por aquí. ❀`,
            mentions: [participante],
          });
        } else if (action === "remove") {
          await sock.sendMessage(chatId, {
            text: `👋 @${numero} salió de *${nombreGrupo}*. ¡Hasta pronto!`,
            mentions: [participante],
          });
        }
      }
    } catch (err) {
      console.log(chalk.red("❌ Error en bienvenida/despedida:"), err);
    }
  });

  // ── Manejo de mensajes (sin prefijo) ─────────────────────────
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      "";

    if (!body) return;

    const numeroLimpio = sender.split("@")[0];
    console.log(chalk.blueBright(`📩 ${numeroLimpio}: `) + body);

    // ── Antilink ────────────────────────────────────────────────
    const esGrupo = chatId.endsWith("@g.us");
    const contieneLink =
      /(https?:\/\/|chat\.whatsapp\.com|wa\.me\/|www\.)/i.test(body);

    if (esGrupo && contieneLink) {
      const configGrupo = obtenerConfigGrupo(chatId);

      if (configGrupo.antilink) {
        const numeroBase = numeroLimpio.split(":")[0];
        const esDueño = numeroBase === config.ownerNumber;
        let esAdmin = false;

        if (!esDueño) {
          try {
            esAdmin = await esAdminDeGrupo(sock, chatId, sender);
          } catch (_) {}
        }

        if (!esDueño && !esAdmin) {
          try {
            await sock.sendMessage(chatId, { delete: msg.key });
          } catch (_) {
            // Si el bot no es admin, no podrá borrar, pero seguimos con el aviso.
          }

          await sock.sendMessage(chatId, {
            text: `🚫 @${numeroBase} no se permiten enlaces en este grupo.`,
            mentions: [sender],
          });

          return;
        }
      }
    }

    const textoLower = body.trim().toLowerCase();
    const primeraPalabra = textoLower.split(/\s+/)[0];
    const args = body.trim().split(/\s+/).slice(1);

    const context = { sender, chatId, body, allPlugins: plugins };

    for (const plugin of plugins) {
      if (plugin.command.includes(primeraPalabra)) {
        try {
          const puedeContinuar = await pasaFiltros(sock, msg, plugin, context);
          if (!puedeContinuar) break;

          await plugin.run(sock, msg, args, context);
        } catch (err) {
          console.log(
            chalk.red(`❌ Error ejecutando el plugin ${plugin.fileName}:`),
            err
          );
        }
        break;
      }
    }
  });
}

startMegumi();