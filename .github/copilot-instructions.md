# Instrucciones para agentes de IA – VitaSport

## Descripción y Arquitectura
- **VitaSport** es una aplicación de escritorio para la gestión de inventario de una tienda de suplementos deportivos, construida con Electron, Node.js y SQLite.
- El código principal está en `src/` (subcarpetas: `main/`, `renderer/`, `database/`).
- El flujo de datos sigue: Electron (main) → Preload (puente seguro) → Renderer (UI) → Base de datos (Knex/SQLite).
- El archivo de base de datos es local: `vitasport.sqlite`.
- Hay un prototipo mínimo en `electron-test/` (solo para pruebas rápidas).

## Reglas y Patrones Clave
- **No accedas directamente a archivos SQLite**: usa siempre la instancia de Knex exportada en `src/database/database.js`.
- **No pongas lógica de negocio en el renderer**: la lógica va en el proceso principal o preload.
- **Nombres y comentarios en español** (tablas, campos, código y mensajes).
- **Roles de usuario**: Admin y Vendedor, con permisos diferenciados (ver detalles en `instrucciones.md`).
- **Alertas automáticas**: stock bajo y vencimiento próximo (15 días).
- **Reportes y estadísticas**: exportación PDF y gráficos con Chart.js.

## Flujo de trabajo típico
1. El usuario inicia la app (escritorio).
2. Login con usuario y contraseña (rol: Admin/Vendedor).
3. Admin: gestiona productos, usuarios, reportes y alertas.
4. Vendedor: registra ventas, consulta stock, ingresa movimientos.
5. El sistema genera reportes y estadísticas exportables.

## Comandos y desarrollo
- **Instalar dependencias:** `npm install`
- **Ejecutar app:** `npm start` (Electron, entrada: `src/main/main.js`)
- **Prototipo web local:** `npm run dev` (si existe script, para pruebas Express)
- **Depuración:** abre DevTools desde la ventana renderer.
- **Agregar tablas/campos:** modifica `src/database/database.js` y reinicia la app.
- **Agregar vistas UI:** edita `src/renderer/index.html` y recarga.

## Dependencias principales
- Electron, Knex, SQLite3, Express (instalado, aún no usado), Bootstrap (UI), Chart.js (gráficos), bcrypt (autenticación), pdfmake/puppeteer (PDF).

## Archivos clave
- `src/main/main.js`: entrada Electron
- `src/database/database.js`: esquema y acceso DB
- `src/renderer/index.html`: UI principal

## Extensiones VSCode recomendadas
- ESLint, Prettier, SQLite Viewer, Tailwind CSS IntelliSense, Live Server, GitLens

## Notas adicionales
- El sistema está pensado para uso en producción por la empresa VitaSport.
- Para detalles completos de requerimientos y flujos, consulta `instrucciones.md`.

---

Para dudas, revisa `instrucciones.md`, `README.md` o consulta a un mantenedor.
