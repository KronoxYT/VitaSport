const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Ruta para Inventario
router.get('/', inventoryController.getInventory);

module.exports = router;