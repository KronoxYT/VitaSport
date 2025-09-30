const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

// Importar Rutas
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const stockRoutes = require('./routes/stockRoutes');
const salesRoutes = require('./routes/salesRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const alertsRoutes = require('./routes/alertsRoutes');

function createApp() {
  const app = express();

  // CORS: permitir el frontend en Vercel y preflight global
  const allowedOrigins = [
    process.env.CORS_ORIGIN || 'https://vitasport-frontend.vercel.app',
  ];
  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // permitir herramientas/healthchecks sin origin
      if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(express.json());

  // --- Rutas de la API ---
  app.use('/api/productos', productRoutes);
  app.use('/api/usuarios', userRoutes);
  app.use('/api/stock', stockRoutes);
  app.use('/api/ventas', salesRoutes);
  app.use('/api/reportes', reportsRoutes);
  app.use('/api/inventario', inventoryRoutes);
  app.use('/api/estadisticas', statisticsRoutes);
  app.use('/api/alertas', alertsRoutes);

  return app;
}

async function runMigrationsIfNeeded() {
  return new Promise((resolve) => {
    if (process.env.RUN_MIGRATIONS_ON_START === 'false') return resolve();
    const child = exec('node src/database/migrate.js', { cwd: process.cwd() });
    child.on('exit', () => resolve());
    child.on('error', () => resolve());
  });
}

async function startServer() {
  await runMigrationsIfNeeded();
  const app = createApp();
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
  });
}

// Iniciar el servidor si no estamos en un entorno de prueba
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { startServer, createApp };