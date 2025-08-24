const knex = require('../database/database');

// GET /api/inventario
const getInventory = async (req, res) => {
  try {
    const productos = await knex('products').select();
    const movimientos = await knex('stock_movements').select('product_id', 'type', 'quantity');
    const stockMap = {};

    movimientos.forEach(mov => {
      if (!stockMap[mov.product_id]) {
        stockMap[mov.product_id] = 0;
      }
      stockMap[mov.product_id] += mov.type === 'ingreso' ? mov.quantity : -mov.quantity;
    });

    const inventario = productos.map(p => ({
      ...p,
      stock_real: stockMap[p.id] || 0
    }));

    res.json({ success: true, inventario });
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener inventario.' });
  }
};

module.exports = {
  getInventory
};