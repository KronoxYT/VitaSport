import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
    }),
    // Gzip compression for production builds
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files larger than 10KB
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression for even better compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  
  build: {
    // Output directory
    outDir: 'dist',
    
    // Enable source maps for production debugging (disable for smaller bundle)
    sourcemap: false,
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for advanced optimizations
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunk for React and React-DOM
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separate chunk for framer-motion (heavy animation library)
          'animations': ['framer-motion'],
          // Separate chunk for icons
          'icons': ['@heroicons/react'],
        },
        
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Optimize CSS
    cssMinify: true,
    
    // Asset inlining threshold (smaller assets will be inlined as base64)
    assetsInlineLimit: 4096,
    
    // Target modern browsers for smaller bundles
    target: 'es2015',
    
    // Report compressed size
    reportCompressedSize: true,
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@heroicons/react',
    ],
    exclude: [],
  },
  
  // Server options for development
  server: {
    port: 3000,
    strictPort: false,
    open: false,
    // Enable CORS
    cors: true,
  },
  
  // Preview server options
  preview: {
    port: 3000,
  },
})
