/**
 * Plugin de ejemplo — Megumi Bot
 * No usa prefijo: el bot responde si el mensaje coincide con alguna palabra de "command".
 */
export default {
  command: ["hola", "hi", "megumi"],
  category: "General",
  description: "Saludo de ejemplo para probar que el bot responde.",
  run: async (sock, msg, args, context) => {
    const { sender, chatId } = context;

    await sock.sendMessage(
      chatId,
      {
        text:
          `❀ Hola, soy *Megumi* ❀\n\n` +
          `Estoy despierta y funcionando correctamente.\n` +
          `Creador: *Edward*\n\n` +
          `_Este es un plugin de ejemplo. Agrega más archivos .js en la carpeta /plugins para darme más comandos._`,
      },
      { quoted: msg }
    );
  },
};
