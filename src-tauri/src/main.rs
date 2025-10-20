// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

// Database models
#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: Option<i32>,
    username: String,
    password_hash: String,
    role: String,
    fullname: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Product {
    id: Option<i32>,
    sku: Option<String>,
    name: String,
    sale_price: Option<f64>,
    brand: Option<String>,
    category: Option<String>,
    presentation: Option<String>,
    flavor: Option<String>,
    weight: Option<String>,
    image_path: Option<String>,
    expiry_date: Option<String>,
    lot_number: Option<String>,
    min_stock: Option<i32>,
    location: Option<String>,
    status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct StockMovement {
    id: Option<i32>,
    product_id: i32,
    movement_type: String, // "ingreso" or "egreso"
    quantity: i32,
    note: Option<String>,
    created_by: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Purchase {
    id: Option<i32>,
    product_id: i32,
    supplier: Option<String>,
    purchase_price: Option<f64>,
    purchase_date: Option<String>,
    discount: Option<f64>,
    expected_replenish_days: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Sale {
    id: Option<i32>,
    product_id: i32,
    quantity: i32,
    sale_price: f64,
    discount: Option<f64>,
    channel: Option<String>,
    sale_date: String,
    created_by: Option<i32>,
}

// Database state
struct AppState {
    db: Mutex<Connection>,
}

// Initialize database
fn init_database() -> Result<Connection> {
    let conn = Connection::open("vitasport.db")?;

    // Create users table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            fullname TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create products table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sku TEXT UNIQUE,
            name TEXT NOT NULL,
            sale_price REAL,
            brand TEXT,
            category TEXT,
            presentation TEXT,
            flavor TEXT,
            weight TEXT,
            image_path TEXT,
            expiry_date TEXT,
            lot_number TEXT,
            min_stock INTEGER,
            location TEXT,
            status TEXT
        )",
        [],
    )?;

    // Create stock_movements table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS stock_movements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            note TEXT,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )",
        [],
    )?;

    // Create purchases table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            supplier TEXT,
            purchase_price REAL,
            purchase_date TEXT,
            discount REAL,
            expected_replenish_days INTEGER,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )",
        [],
    )?;

    // Create sales table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            sale_price REAL NOT NULL,
            discount REAL,
            channel TEXT,
            sale_date TEXT NOT NULL,
            created_by INTEGER,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        )",
        [],
    )?;

    Ok(conn)
}

// Tauri commands
#[tauri::command]
fn get_products(state: State<AppState>) -> Result<Vec<Product>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, sku, name, sale_price, brand, category, presentation, flavor, weight, image_path, expiry_date, lot_number, min_stock, location, status FROM products")
        .map_err(|e| e.to_string())?;

    let products = stmt
        .query_map([], |row| {
            Ok(Product {
                id: row.get(0)?,
                sku: row.get(1)?,
                name: row.get(2)?,
                sale_price: row.get(3)?,
                brand: row.get(4)?,
                category: row.get(5)?,
                presentation: row.get(6)?,
                flavor: row.get(7)?,
                weight: row.get(8)?,
                image_path: row.get(9)?,
                expiry_date: row.get(10)?,
                lot_number: row.get(11)?,
                min_stock: row.get(12)?,
                location: row.get(13)?,
                status: row.get(14)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(products)
}

#[tauri::command]
fn add_product(state: State<AppState>, product: Product) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO products (sku, name, sale_price, brand, category, presentation, flavor, weight, image_path, expiry_date, lot_number, min_stock, location, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
        rusqlite::params![
            product.sku,
            product.name,
            product.sale_price,
            product.brand,
            product.category,
            product.presentation,
            product.flavor,
            product.weight,
            product.image_path,
            product.expiry_date,
            product.lot_number,
            product.min_stock,
            product.location,
            product.status,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn update_product(state: State<AppState>, product: Product) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE products SET sku=?1, name=?2, sale_price=?3, brand=?4, category=?5, presentation=?6, flavor=?7, weight=?8, image_path=?9, expiry_date=?10, lot_number=?11, min_stock=?12, location=?13, status=?14 
         WHERE id=?15",
        rusqlite::params![
            product.sku,
            product.name,
            product.sale_price,
            product.brand,
            product.category,
            product.presentation,
            product.flavor,
            product.weight,
            product.image_path,
            product.expiry_date,
            product.lot_number,
            product.min_stock,
            product.location,
            product.status,
            product.id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn delete_product(state: State<AppState>, id: i32) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM products WHERE id=?1", [id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_stock_movements(state: State<AppState>) -> Result<Vec<StockMovement>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, product_id, type, quantity, note, created_by FROM stock_movements ORDER BY created_at DESC LIMIT 100")
        .map_err(|e| e.to_string())?;

    let movements = stmt
        .query_map([], |row| {
            Ok(StockMovement {
                id: row.get(0)?,
                product_id: row.get(1)?,
                movement_type: row.get(2)?,
                quantity: row.get(3)?,
                note: row.get(4)?,
                created_by: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(movements)
}

#[tauri::command]
fn add_stock_movement(state: State<AppState>, movement: StockMovement) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO stock_movements (product_id, type, quantity, note, created_by) 
         VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![
            movement.product_id,
            movement.movement_type,
            movement.quantity,
            movement.note,
            movement.created_by,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn get_sales(state: State<AppState>) -> Result<Vec<Sale>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, product_id, quantity, sale_price, discount, channel, sale_date, created_by FROM sales ORDER BY sale_date DESC LIMIT 100")
        .map_err(|e| e.to_string())?;

    let sales = stmt
        .query_map([], |row| {
            Ok(Sale {
                id: row.get(0)?,
                product_id: row.get(1)?,
                quantity: row.get(2)?,
                sale_price: row.get(3)?,
                discount: row.get(4)?,
                channel: row.get(5)?,
                sale_date: row.get(6)?,
                created_by: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(sales)
}

#[tauri::command]
fn add_sale(state: State<AppState>, sale: Sale) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO sales (product_id, quantity, sale_price, discount, channel, sale_date, created_by) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            sale.product_id,
            sale.quantity,
            sale.sale_price,
            sale.discount,
            sale.channel,
            sale.sale_date,
            sale.created_by,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

fn main() {
    let db = init_database().expect("Failed to initialize database");

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState { db: Mutex::new(db) })
        .invoke_handler(tauri::generate_handler![
            get_products,
            add_product,
            update_product,
            delete_product,
            get_stock_movements,
            add_stock_movement,
            get_sales,
            add_sale,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
