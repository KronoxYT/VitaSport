const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Rutas para Reportes en PDF
router.get('/inventario/pdf', reportsController.getInventoryPdf);
router.get('/ventas/pdf', reportsController.getSalesPdf);
router.get('/general/pdf', reportsController.getGeneralPdf);

module.exports = router;