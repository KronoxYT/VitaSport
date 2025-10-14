Migración inicial a Tauri

Pasos rápidos:

1. Instalar herramienta Tauri (requiere Rust + cargo)

   npm install --save-dev @tauri-apps/cli
   npm install @tauri-apps/api

2. Desarrollo:

   npm run tauri:dev

3. Empaquetado (construir renderer primero):

   npm run tauri:build

Notas:
- El proyecto original usaba Electron con `src/main/main.js` que contiene lógica IPC y un servidor Node embebido (`src/server.js`).
- Para usar Tauri, es recomendable migrar las llamadas IPC a la API de Tauri (comandos Rust o `@tauri-apps/api`) y mover la lógica del servidor Node a un proceso separado o adaptarla para ejecutarse como binario incluido.
- Este repositorio ahora incluye `src-tauri` con configuración mínima. Revisa `src/main` y `src/renderer` para terminar la migración.
