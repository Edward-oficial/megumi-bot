import { registrarUsuario, estaRegistrado } from "../middlewares.js";

export default {
  command: ["register", "registrar"],
  category: "General",
  description: "Regístrate para poder usar los comandos. Uso: register Nombre,Edad",
  noRegister: true,
  run: async (sock, msg, args, context) => {
    const { chatId, sender } = context;
    const numero = sender.split("@")[0];

    if (estaRegistrado(numero)) {
      await sock.sendMessage(
        chatId,
        { text: "❀ Ya estás registrado, no necesitas hacerlo de nuevo." },
        { quoted: msg }
      );
      return;
    }

    const datos = args.join(" ").split(",");
    const nombre = datos[0]?.trim();
    const edad = datos[1]?.trim();

    if (!nombre || !edad) {
      await sock.sendMessage(
        chatId,
        {
          text:
            "❀ Formato incorrecto.\n" +
            "Uso: *register Nombre,Edad*\n" +
            "Ejemplo: register Edward,20",
        },
        { quoted: msg }
      );
      return;
    }

    registrarUsuario(numero, { nombre, edad });

    await sock.sendMessage(
      chatId,
      { text: `✅ Registro exitoso, bienvenido *${nombre}* (${edad} años).` },
      { quoted: msg }
    );
  },
};