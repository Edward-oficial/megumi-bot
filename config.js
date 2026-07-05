export const config = {
  botName: "Megumi",
  creator: "Edward",
  // Número del dueño del bot (con código de país, sin + ni espacios). Ej: 50499999999
  ownerNumber: "50400000000",
  // Carpeta donde se guarda la sesión de WhatsApp
  sessionFolder: "./session",
  // Carpeta donde viven los plugins/comandos
  pluginsFolder: "./plugins",

  // API de Edward — nunca pongas la apiKey directo en los plugins, siempre desde aquí
  api: {
    baseUrl: "https://dv-edward.onrender.com",
    apiKey: "edward",
  },
};
