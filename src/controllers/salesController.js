const knex = require('../database/database');

// --- Funciones de Ayuda ---
function jsonToCsv(jsonData) {
    if (!jsonData || jsonData.length === 0) {
        return '';
    }
    const keys = Object.keys(jsonData[0]);
    const csvRows = [];
    // Añadir cabeceras
    csvRows.push(keys.join(','));

    // Añadir filas
    for (const row of jsonData) {
        const values = keys.map(key => {
            let val = row[key] === null || row[key] === undefined ? '' : row[key];
            val = String(val);
            // Escapar comillas dobles
            if (val.includes('"')) {
                val = val.replace(/"/g, '""');
            }
            // Envolver en comillas dobles si contiene comas, saltos de línea o comillas
            if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                val = `"${val}"`;
            }
            return val;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}


// GET /api/ventas
const getAllSales = async (req, res) => {
  try {
    const ventas = await knex('sales')
      .leftJoin('products', 'sales.product_id', 'products.id')
      .leftJoin('users', 'sales.created_by', 'users.id')
      .select(
        'sales.*',
        'products.name as product_name',
        'users.username as vendedor'
      );
    res.json({ success: true, ventas });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener ventas.' });
  }
};

// POST /api/ventas
const createSale = async (req, res) => {
  try {
    const { product_id, quantity, sale_price, discount, channel, sale_date, created_by } = req.body;
    if (!product_id || !quantity || !sale_price || !created_by) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
    }
    const [id] = await knex('sales').insert({ product_id, quantity, sale_price, discount, channel, sale_date, created_by });
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error al registrar venta:', error);
    res.status(500).json({ success: false, message: 'Error al registrar venta.' });
  }
};

// DELETE /api/ventas/:id
const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await knex('sales').where({ id }).del();
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Venta no encontrada.' });
    }
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar venta.' });
  }
};

// GET /api/ventas/csv
const exportSalesCsv = async (req, res) => {
    try {
        const ventas = await knex('sales')
            .leftJoin('products', 'sales.product_id', 'products.id')
            .leftJoin('users', 'sales.created_by', 'users.id')
            .select(
                'sales.id as Venta_ID',
                'sales.sale_date as Fecha',
                'products.name as Producto',
                'sales.quantity as Cantidad',
                'sales.sale_price as Precio_Unitario',
                'sales.discount as Descuento',
                'sales.channel as Canal',
                'users.username as Vendedor'
            );

        const csvData = jsonToCsv(ventas);
        res.header('Content-Type', 'text/csv');
        res.attachment('reporte_ventas.csv');
        res.send(csvData);

    } catch (error) {
        console.error('Error al exportar ventas a CSV:', error);
        res.status(500).json({ success: false, message: 'Error al exportar ventas.' });
    }
};

module.exports = {
  getAllSales,
  createSale,
  deleteSale,
  exportSalesCsv
};