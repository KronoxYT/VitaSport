const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

// Rutas para Estadísticas
router.get('/ventas-producto', statisticsController.getSalesByProduct);
router.get('/ventas-mes', statisticsController.getSalesByMonth);

module.exports = router;