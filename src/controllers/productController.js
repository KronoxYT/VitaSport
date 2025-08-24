const knex = require('../database/database');

// GET /api/productos
const getAllProducts = async (req, res) => {
  try {
    const productos = await knex('products').select();
    // Calcular stock real para cada producto
    const movimientos = await knex('stock_movements').select('product_id', 'type', 'quantity');
    const stockMap = {};
    movimientos.forEach(mov => {
      if (!stockMap[mov.product_id]) stockMap[mov.product_id] = 0;
      stockMap[mov.product_id] += mov.type === 'ingreso' ? mov.quantity : -mov.quantity;
    });
    const productosConStock = productos.map(p => ({ ...p, stock_real: stockMap[p.id] || 0 }));
    res.json({ success: true, productos: productosConStock });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener productos.' });
  }
};

// GET /api/productos/:id
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await knex('products').where({ id }).first();
    if (producto) {
      res.json({ success: true, producto });
    } else {
      res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener producto.' });
  }
};

// POST /api/productos
const createProduct = async (req, res) => {
  try {
    const nuevo = req.body;
    // Validación básica
    if (!nuevo.name) {
      return res.status(400).json({ success: false, message: 'El nombre del producto es obligatorio.' });
    }
    const [id] = await knex('products').insert(nuevo);
    res.status(201).json({ success: true, id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear producto.' });
  }
};

// PUT /api/productos/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'El nombre del producto es obligatorio.' });
    }
    await knex('products').where({ id }).update(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar producto.' });
  }
};

// DELETE /api/productos/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await knex('products').where({ id }).del();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar producto.' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
