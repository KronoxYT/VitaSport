import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Vite options tailored for Tauri development
  clearScreen: false,
  
  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 5173,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  envPrefix: ["VITE_", "TAURI_"],
  
  build: {
    target: process.env.TAURI_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
