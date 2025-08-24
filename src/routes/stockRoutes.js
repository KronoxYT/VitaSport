const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Rutas para Movimientos de Stock

// POST /api/stock-movements -> Crear un nuevo movimiento de stock
router.post('/', stockController.createStockMovement);

// GET /api/stock-movements/:productId -> Obtener historial de movimientos de un producto
router.get('/:productId', stockController.getStockMovementsByProductId);


module.exports = router;