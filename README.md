# 🌸 Megumi Bot

Bot base de WhatsApp, sin prefijo, con carga dinámica de plugins.
Creador: **Edward**

## 📦 Instalación (Termux o cualquier terminal)

```bash
cd megumi-bot
npm install
```

## ▶️ Ejecutar

```bash
npm start
```

Al iniciar por primera vez, la consola te preguntará:

```
¿Cómo quieres vincular a Megumi?
1) Código de 8 dígitos
2) Código QR
Elige 1 o 2:
```

- Si eliges **1**, te pedirá tu número de WhatsApp (con código de país, sin `+` ni espacios, ej: `50499999999`) y te mostrará el código de 8 dígitos para ingresarlo en WhatsApp > Dispositivos vinculados > Vincular con número de teléfono.
- Si eliges **2**, se mostrará un código QR en la terminal para escanear desde WhatsApp > Dispositivos vinculados.

La sesión se guarda en la carpeta `session/`, así que las próximas veces no te volverá a pedir vincular (mientras no borres esa carpeta).

## 🧩 Estructura del proyecto

```
megumi-bot/
├── index.js          # Archivo principal, conexión y manejo de mensajes
├── pluginLoader.js   # Cargador dinámico de plugins
├── config.js         # Configuración básica (nombre, dueño, rutas)
├── plugins/
│   └── ejemplo-hola.js  # Plugin de ejemplo (sin prefijo)
├── session/          # Se genera automáticamente al vincular
├── package.json
└── README.md
```

## ➕ Cómo agregar comandos (sin prefijo)

Crea un archivo `.js` dentro de `plugins/` con esta estructura:

```js
export default {
  command: ["palabra1", "palabra2"], // palabras que activan el plugin
  description: "Qué hace este comando",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    await sock.sendMessage(chatId, { text: "Respuesta aquí" }, { quoted: msg });
  },
};
```

Megumi carga automáticamente todos los archivos de `plugins/` al iniciar, no hay que registrar nada a mano.

## ⚙️ Configuración

Edita `config.js` para cambiar el número del dueño (`ownerNumber`) u otros datos básicos.

---
Hecho con ❀ para el ecosistema de bots de **Edward**.
