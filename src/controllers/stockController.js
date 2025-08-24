const knex = require('../database/database');

// GET /api/stock-movements/:productId
const getStockMovementsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const movements = await knex('movimientos_stock')
      .where({ producto_id: productId })
      .orderBy('fecha', 'desc');
    res.json({ success: true, movements });
  } catch (error) {
    console.error('Error al obtener movimientos de stock:', error);
    res.status(500).json({ success: false, message: 'Error del servidor al obtener movimientos de stock.' });
  }
};

// POST /api/stock-movements
const createStockMovement = async (req, res) => {
  const { producto_id, tipo_movimiento, cantidad, motivo, user_id } = req.body;

  // Validaciones básicas
  if (!producto_id || !tipo_movimiento || !cantidad) {
    return res.status(400).json({ success: false, message: 'Los campos producto_id, tipo_movimiento y cantidad son obligatorios.' });
  }

  if (!['entrada', 'salida', 'ajuste'].includes(tipo_movimiento)) {
    return res.status(400).json({ success: false, message: 'El tipo_movimiento no es válido.' });
  }

  const trx = await knex.transaction();
  try {
    // 1. Insertar el movimiento de stock
    const [movimientoId] = await trx('movimientos_stock').insert({
      producto_id,
      tipo_movimiento,
      cantidad,
      motivo,
      user_id
    });

    // 2. Calcular el ajuste de stock
    let stockChange = 0;
    if (tipo_movimiento === 'entrada') {
      stockChange = parseInt(cantidad, 10);
    } else if (tipo_movimiento === 'salida') {
      stockChange = -parseInt(cantidad, 10);
    } else { // 'ajuste'
      // Para 'ajuste', la cantidad es el nuevo stock total.
      // Necesitamos obtener el stock actual para calcular la diferencia.
      const productoActual = await trx('productos').where('id', producto_id).first('stock');
      stockChange = parseInt(cantidad, 10) - productoActual.stock;
    }

    // 3. Actualizar el stock del producto
    await trx('productos')
      .where('id', producto_id)
      .increment('stock', stockChange);

    // Si todo va bien, confirmar la transacción
    await trx.commit();

    res.status(201).json({ success: true, id: movimientoId, message: 'Movimiento de stock registrado y stock actualizado.' });

  } catch (error) {
    // Si algo falla, revertir la transacción
    await trx.rollback();
    console.error('Error al crear movimiento de stock (transacción revertida):', error);
    res.status(500).json({ success: false, message: 'Error del servidor al procesar el movimiento.' });
  }
};

module.exports = {
  getStockMovementsByProductId,
  createStockMovement,
};