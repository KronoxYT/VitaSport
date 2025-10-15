import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['@tauri-apps/api/tauri', '@tauri-apps/api/shell', '@tauri-apps/api/path']
    }
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  clearScreen: false,
});
