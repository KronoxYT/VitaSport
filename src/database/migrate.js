const knex = require('./database');
const bcrypt = require('bcrypt');

async function setupDatabase() {
  try {
    console.log('Iniciando migración de la base de datos...');

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
      console.log('Tabla \'users\' creada.');
    }

    // Seed para el usuario administrador
    const users = await knex('users').select();
    if (users.length === 0) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash('admin', saltRounds);
      await knex('users').insert({
        username: 'admin',
        password_hash: passwordHash,
        role: 'Administrador',
        fullname: 'Administrador del Sistema'
      });
      console.log('Usuario administrador por defecto creado.');
    }

    // Crear tabla de productos
    if (!(await knex.schema.hasTable('products'))) {
      await knex.schema.createTable('products', table => {
        table.increments('id').primary();
        table.string('sku').unique();
        table.string('name').notNullable();
        table.decimal('sale_price');
        table.string('brand');
        table.string('category');
        table.string('presentation');
        table.string('flavor');
        table.string('weight');
        table.string('image_path'); // Campo para la imagen
        table.date('expiry_date');
        table.string('lot_number');
        table.integer('min_stock');
        table.string('location');
        table.string('status');
      });
      console.log('Tabla \'products\' creada.');
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
      console.log('Tabla \'stock_movements\' creada.');
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
      console.log('Tabla \'purchases\' creada.');
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
      console.log('Tabla \'sales\' creada.');
    }

    console.log('Migración de la base de datos completada.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    // Asegurarse de cerrar la conexión
    await knex.destroy();
  }
}

setupDatabase();
