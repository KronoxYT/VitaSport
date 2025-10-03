# VitaSport React frontend

Scaffold Vite + React minimal to migrate the static frontend.

How to run locally:

```powershell
cd src/renderer/react-app
npm install
npm run dev
```

Build for production:

```powershell
npm run build
```

Vercel settings:
- Root Directory: src/renderer/react-app
- Build Command: npm run build
- Output Directory: dist
- Environment variable: VITE_API_BASE_URL=https://vitasport-2.onrender.com
