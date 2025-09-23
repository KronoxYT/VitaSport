const express = require('express');
const cors = require('cors');

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
  app.use(cors());
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

function startServer() {
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