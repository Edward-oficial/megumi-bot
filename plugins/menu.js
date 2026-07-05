import { config } from "../config.js";

const MENU_IMAGE = "https://files.catbox.moe/1farsq.webp";

export default {
  command: ["menu", "help", "ayuda"],
  category: "General",
  description: "Muestra el menú de comandos ordenado por categorías.",
  run: async (sock, msg, args, context) => {
    const { chatId, allPlugins } = context;

    const categorias = {};

    for (const plugin of allPlugins) {
      const categoria = plugin.category || "Otros";
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push(plugin);
    }

    const fecha = new Date().toLocaleString("es-HN", {
      dateStyle: "short",
      timeStyle: "short",
    });

    let texto = `╭─❀ *${config.botName.toUpperCase()}* ❀─╮\n`;
    texto += `│ 👑 Creador: *${config.creator}*\n`;
    texto += `│ 🕐 ${fecha}\n`;
    texto += `╰────────────────╯\n`;

    const nombresCategorias = Object.keys(categorias).sort();

    for (const categoria of nombresCategorias) {
      texto += `\n┌─「 *${categoria}* 」\n`;
      for (const plugin of categorias[categoria]) {
        const comandoPrincipal = plugin.command[0];
        texto += `│ ✦ *${comandoPrincipal}*\n`;
        texto += `│   ${plugin.description || "Sin descripción"}\n`;
      }
      texto += `└────────────────\n`;
    }

    texto += `\n_✿ No se usa prefijo, solo escribe el comando tal cual._`;

    await sock.sendMessage(
      chatId,
      {
        image: { url: MENU_IMAGE },
        caption: texto,
      },
      { quoted: msg }
    );
  },
};
