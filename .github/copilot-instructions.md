# Copilot Instructions for VitaSport

## Project Overview
- **VitaSport** is a Node.js/Electron-based application for inventory, sales, and user management, using a local SQLite database (`vitasport.sqlite`).
- The codebase is organized into `src/` (backend, controllers, routes, database), `src/renderer/` (frontend, views), and root-level config/docs.

## Architecture & Data Flow
- **Backend**: Express server (`src/server.js`) exposes REST APIs for products, inventory, sales, users, etc. Each resource has a controller (`src/controllers/`) and a route file (`src/routes/`).
- **Database**: SQLite, managed via `src/database/database.js` and migrations in `src/database/migrate.js`.
- **Frontend**: Electron renderer (`src/renderer/`), with HTML/JS views for dashboard, inventory, sales, reports, and users. Communication with backend via HTTP requests.

## Key Patterns & Conventions
- **Controllers**: Each controller handles business logic for a resource (e.g., `productController.js`).
- **Routes**: Route files map HTTP endpoints to controller methods (e.g., `productRoutes.js`).
- **Views**: Each major UI section has its own HTML/JS pair in `src/renderer/views/`.
- **Config**: Environment variables in `VitaSport-2.env`. App config in `src/renderer/config.js`.
- **Testing**: API tests in `src/__tests__/` using Jest (see `product.api.test.js`).

## Developer Workflows
- **Start app**: `node src/server.js` (backend), then run Electron for frontend (see `main.js`).
- **Run tests**: `npx jest` (ensure SQLite DB is present).
- **Migrations**: Run `node src/database/migrate.js` to update DB schema.
- **Debugging**: Use console logs in controllers/routes; frontend debugging via browser devtools in Electron.

## Integration & Dependencies
- **Express** for backend API
- **Electron** for desktop frontend
- **SQLite** for local storage
- **Jest** for testing

## Project-Specific Notes
- Keep backend and frontend in sync for API changes.
- Use controller/route/view structure for new features.
- Example: To add a new resource, create a controller, route, and (if needed) a view.
- Sensitive config (DB path, secrets) should be in `.env` files, not hardcoded.

## Key Files/Directories
- `src/server.js`: Express app entry point
- `src/controllers/`: Business logic
- `src/routes/`: API endpoints
- `src/database/`: DB connection & migrations
- `src/renderer/views/`: UI views
- `src/__tests__/`: API tests

---
_Keep these conventions in mind when generating or editing code. If unsure about a pattern, check the relevant directory for examples._
