const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// Rutas para Ventas
router.get('/', salesController.getAllSales);
router.post('/', salesController.createSale);
router.delete('/:id', salesController.deleteSale);
router.get('/csv', salesController.exportSalesCsv);

module.exports = router;