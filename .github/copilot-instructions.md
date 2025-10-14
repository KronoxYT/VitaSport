# 🧠 Instrucción para GitHub Copilot

Necesito que migres este proyecto web (Vite + React) a una aplicación de escritorio con **Tauri**.

**Contexto del proyecto:**
- Nombre: VitaSport
- Organización: MeaCore Enterprise
- Repositorio: https://github.com/KronoxYT/VitaSport
- Backend online: https://vitasport-api.onrender.com
- Base de datos: SQLite (local) o Postgres (en Render)
- Lenguaje: JavaScript/React
- Objetivo: crear ejecutables (.exe, .AppImage, .dmg) con auto-actualización.

---

## 🚀 Tareas que debe ejecutar Copilot

1. **Instalar dependencias de Tauri**
   ```bash
   npm install --save-dev @tauri-apps/cli
   npm install @tauri-apps/api
