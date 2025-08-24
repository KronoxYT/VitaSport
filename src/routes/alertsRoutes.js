const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

// Rutas para Alertas
router.get('/stock-bajo', alertsController.getLowStockAlerts);
router.get('/vencimiento', alertsController.getExpiryAlerts);

module.exports = router;