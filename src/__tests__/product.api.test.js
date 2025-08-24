const request = require('supertest');
const { createApp } = require('../server');
const knex = require('../database/database');

// Creamos una instancia de la app para testing
const app = createApp();

// Función para crear el esquema de la base de datos en el entorno de prueba
async function setupTestDatabase() {
  // Crear tabla de usuarios
  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', table => {
      table.increments('id').primary();
      table.string('username').unique().notNullable();
      table.string('password_hash').notNullable();
      table.string('role').notNullable();
      table.string('fullname');
      table.timestamps(true, true);
    });
  }

  // Crear tabla de productos
  if (!(await knex.schema.hasTable('products'))) {
    await knex.schema.createTable('products', table => {
      table.increments('id').primary();
      table.string('sku').unique();
      table.string('name').notNullable();
      table.string('brand');
      table.string('category');
      table.decimal('sale_price'); // Añadido para que coincida con el test
      table.string('presentation');
      table.string('flavor');
      table.string('weight');
      table.string('image_path');
      table.date('expiry_date');
      table.string('lot_number');
      table.integer('min_stock');
      table.string('location');
      table.string('status');
    });
  }

  // Crear tabla de movimientos de stock
  if (!(await knex.schema.hasTable('stock_movements'))) {
    await knex.schema.createTable('stock_movements', table => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products');
      table.string('type').notNullable(); // ingreso/egreso
      table.integer('quantity').notNullable();
      table.string('note');
      table.integer('created_by').unsigned().references('id').inTable('users');
      table.timestamps(true, true);
    });
  }

  // Crear tabla de compras
  if (!(await knex.schema.hasTable('purchases'))) {
    await knex.schema.createTable('purchases', table => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products');
      table.string('supplier');
      table.decimal('purchase_price');
      table.date('purchase_date');
      table.decimal('discount');
      table.integer('expected_replenish_days');
    });
  }

  // Crear tabla de ventas
  if (!(await knex.schema.hasTable('sales'))) {
    await knex.schema.createTable('sales', table => {
      table.increments('id').primary();
      table.integer('product_id').unsigned().references('id').inTable('products');
      table.integer('quantity');
      table.decimal('sale_price');
      table.decimal('discount');
      table.string('channel');
      table.date('sale_date');
      table.integer('created_by').unsigned().references('id').inTable('users');
    });
  }
}

describe('API de Productos', () => {

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    // Limpiar las tablas después de cada prueba para asegurar aislamiento
    await knex('stock_movements').del();
    await knex('purchases').del();
    await knex('sales').del();
    await knex('products').del();
    await knex('users').del();
  });

  afterAll(async () => {
    // Cerrar la conexión a la base de datos
    await knex.destroy();
  });

  // Test para GET /api/productos
  it('debería obtener una lista vacía de productos', async () => {
    const response = await request(app).get('/api/productos');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.productos).toEqual([]);
  });

  // Test para POST /api/productos
  it('debería crear un nuevo producto', async () => {
    const nuevoProducto = {
      name: 'Proteína Whey',
      sku: 'PW-001',
      brand: 'VitaSport',
      category: 'Suplementos',
      sale_price: 49.99
    };
    const response = await request(app)
      .post('/api/productos')
      .send(nuevoProducto);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.id).toBeDefined();

    // Verificar que el producto se guardó en la BD
    const productInDb = await knex('products').where({ id: response.body.id }).first();
    expect(productInDb.name).toBe(nuevoProducto.name);
  });

  // Test para GET /api/productos/:id
  it('debería obtener un producto por su ID', async () => {
    const [id] = await knex('products').insert({ name: 'Creatina Monohidratada', sale_price: 25.00 });

    const response = await request(app).get(`/api/productos/${id}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.producto.id).toBe(id);
    expect(response.body.producto.name).toBe('Creatina Monohidratada');
  });

  // Test para PUT /api/productos/:id
  it('debería actualizar un producto existente', async () => {
    const [id] = await knex('products').insert({ name: 'BCAA en Polvo', sale_price: 30.00 });
    const datosActualizados = { name: 'BCAA 5000mg', sale_price: 32.50 };

    const response = await request(app)
      .put(`/api/productos/${id}`)
      .send(datosActualizados);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const productInDb = await knex('products').where({ id }).first();
    expect(productInDb.name).toBe(datosActualizados.name);
    expect(productInDb.sale_price).toBe(datosActualizados.sale_price);
  });

  // Test para DELETE /api/productos/:id
  it('debería eliminar un producto', async () => {
    const [id] = await knex('products').insert({ name: 'Multivitamínico', sale_price: 15.00 });

    const response = await request(app).delete(`/api/productos/${id}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const productInDb = await knex('products').where({ id }).first();
    expect(productInDb).toBeUndefined();
  });

});