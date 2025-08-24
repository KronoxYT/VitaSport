const knex = require('../database/database');

// GET /api/estadisticas/ventas-producto
const getSalesByProduct = async (req, res) => {
  try {
    const rows = await knex('sales')
      .leftJoin('products', 'sales.product_id', 'products.id')
      .select('products.name as producto')
      .sum('sales.quantity as total')
      .groupBy('products.name');
    res.json({ success: true, datos: rows });
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas por producto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas.' });
  }
};

// GET /api/estadisticas/ventas-mes
const getSalesByMonth = async (req, res) => {
  try {
    const rows = await knex('sales')
      .select(knex.raw("strftime('%Y-%m', sale_date) as mes"))
      .sum('quantity as total')
      .groupBy('mes')
      .orderBy('mes', 'asc');
    res.json({ success: true, datos: rows });
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas por mes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener estadísticas.' });
  }
};

module.exports = {
  getSalesByProduct,
  getSalesByMonth
};