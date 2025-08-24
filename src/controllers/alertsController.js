const knex = require('../database/database');

// GET /api/alertas/stock-bajo
const getLowStockAlerts = async (req, res) => {
  try {
    const productos = await knex('products').select('id', 'name', 'min_stock');
    const movimientos = await knex('stock_movements').select('product_id', 'type', 'quantity');
    const stockMap = {};

    movimientos.forEach(mov => {
      if (!stockMap[mov.product_id]) {
        stockMap[mov.product_id] = 0;
      }
      stockMap[mov.product_id] += mov.type === 'ingreso' ? mov.quantity : -mov.quantity;
    });

    const alertas = productos
      .filter(p => {
        const stock = stockMap[p.id] || 0;
        return p.min_stock && stock <= p.min_stock;
      })
      .map(p => ({ 
        id: p.id, 
        nombre: p.name, 
        stock: stockMap[p.id] || 0, 
        min_stock: p.min_stock 
      }));

    res.json({ success: true, alertas });
  } catch (error) {
    console.error('Error al obtener alertas de stock bajo:', error);
    res.status(500).json({ success: false, message: 'Error al obtener alertas de stock.' });
  }
};

// GET /api/alertas/vencimiento
const getExpiryAlerts = async (req, res) => {
  try {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + 15);

    const productos = await knex('products')
      .whereNotNull('expiry_date')
      .andWhere('expiry_date', '>=', hoy.toISOString().slice(0, 10))
      .andWhere('expiry_date', '<=', limite.toISOString().slice(0, 10))
      .select('id', 'name', 'expiry_date');

    res.json({ success: true, alertas: productos });
  } catch (error) {
    console.error('Error al obtener alertas de vencimiento:', error);
    res.status(500).json({ success: false, message: 'Error al obtener alertas de vencimiento.' });
  }
};

module.exports = {
  getLowStockAlerts,
  getExpiryAlerts
};