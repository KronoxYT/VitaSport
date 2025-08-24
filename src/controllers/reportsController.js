const knex = require('../database/database');
const PdfPrinter = require('pdfmake');

// Configuración de fuentes para PDFMake
const vfs = require('pdfmake/build/vfs_fonts.js');
const fonts = {
  Roboto: {
    normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
    bold: Buffer.from(vfs['Roboto-Medium.ttf'], 'base64'),
    italics: Buffer.from(vfs['Roboto-Italic.ttf'], 'base64'),
    bolditalics: Buffer.from(vfs['Roboto-MediumItalic.ttf'], 'base64')
  }
};

const printer = new PdfPrinter(fonts);

// Función de utilidad para generar y enviar el PDF
function generateAndSendPdf(res, docDefinition, filename) {
  try {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => {
      const pdfBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    });
    pdfDoc.end();
  } catch (error) {
    console.error(`Error al generar PDF (${filename}):`, error);
    res.status(500).json({ success: false, message: 'Error al generar el reporte en PDF.' });
  }
}

// GET /api/reportes/inventario/pdf
const getInventoryPdf = async (req, res) => {
  try {
    const productos = await knex('products').select();
    const movimientos = await knex('stock_movements').select('product_id', 'type', 'quantity');
    const stockMap = {};
    movimientos.forEach(mov => {
      if (!stockMap[mov.product_id]) stockMap[mov.product_id] = 0;
      stockMap[mov.product_id] += mov.type === 'ingreso' ? mov.quantity : -mov.quantity;
    });

    const body = [
      ["SKU", "Nombre", "Marca", "Categoría", "Stock", "Precio Venta", "Vencimiento"]
    ];
    productos.forEach(p => {
      body.push([
        p.sku || '',
        p.name || '',
        p.brand || '',
        p.category || '',
        (stockMap[p.id] || 0).toString(),
        p.sale_price?.toString() || '0.00',
        p.expiry_date || 'N/A'
      ]);
    });

    const docDefinition = {
      content: [
        { text: 'Inventario de Productos', style: 'header' },
        { text: `Fecha de generación: ${(new Date()).toLocaleString()}` },
        { table: { headerRows: 1, widths: Array(7).fill('*'), body } }
      ],
      styles: { header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] } }
    };

    generateAndSendPdf(res, docDefinition, 'reporte_inventario.pdf');

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al generar PDF de inventario.' });
  }
};

// GET /api/reportes/ventas/pdf
const getSalesPdf = async (req, res) => {
  try {
    const ventas = await knex('sales')
      .leftJoin('products', 'sales.product_id', 'products.id')
      .leftJoin('users', 'sales.created_by', 'users.id')
      .select(
        'sales.id',
        'products.name as producto',
        'sales.quantity',
        'sales.sale_price',
        'sales.discount',
        'sales.channel',
        'sales.sale_date',
        'users.username as vendedor'
      );

    const body = [
      ["ID", "Producto", "Cantidad", "Precio", "Descuento", "Canal", "Fecha", "Vendedor"]
    ];
    ventas.forEach(v => {
      body.push([
        v.id.toString(),
        v.producto || '',
        v.quantity?.toString() || '',
        v.sale_price?.toString() || '',
        v.discount?.toString() || '',
        v.channel || '',
        v.sale_date || '',
        v.vendedor || ''
      ]);
    });

    const docDefinition = {
      content: [
        { text: 'Reporte de Ventas', style: 'header' },
        { text: `Fecha de generación: ${(new Date()).toLocaleString()}` },
        { table: { headerRows: 1, widths: Array(8).fill('*'), body } }
      ],
      styles: { header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] } }
    };

    generateAndSendPdf(res, docDefinition, 'reporte_ventas.pdf');

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al generar PDF de ventas.' });
  }
};

// GET /api/reportes/general/pdf
const getGeneralPdf = async (req, res) => {
  try {
    const ventasMes = await knex('sales')
      .select(knex.raw("strftime('%Y-%m', sale_date) as mes"))
      .sum('quantity as total')
      .groupBy('mes')
      .orderBy('mes', 'asc');

    const ventasProducto = await knex('sales')
      .leftJoin('products', 'sales.product_id', 'products.id')
      .select('products.name as producto')
      .sum('quantity as total')
      .groupBy('products.name');

    const docDefinition = {
      content: [
        { text: 'Reporte General', style: 'header' },
        { text: `Fecha de generación: ${(new Date()).toLocaleString()}` },
        { text: 'Ventas por Mes', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              ['Mes', 'Total de Ventas'],
              ...ventasMes.map(item => [item.mes, item.total.toString()])
            ]
          }
        },
        { text: 'Ventas por Producto', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              ['Producto', 'Total Vendido'],
              ...ventasProducto.map(item => [item.producto, item.total.toString()])
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
      }
    };

    generateAndSendPdf(res, docDefinition, 'reporte_general.pdf');

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al generar PDF general.' });
  }
};

module.exports = {
  getInventoryPdf,
  getSalesPdf,
  getGeneralPdf
};