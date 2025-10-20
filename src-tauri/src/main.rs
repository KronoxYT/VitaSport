// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

// Database models
#[derive(Debug, Serialize, Deserialize)]
struct Product {
    id: Option<i32>,
    name: String,
    sku: String,
    category: String,
    price: f64,
    stock: i32,
    min_stock: i32,
    description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Sale {
    id: Option<i32>,
    date: String,
    client: String,
    total: f64,
    status: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct InventoryMovement {
    id: Option<i32>,
    product_id: i32,
    movement_type: String, // "entrada" or "salida"
    quantity: i32,
    date: String,
    notes: Option<String>,
}

// Database state
struct AppState {
    db: Mutex<Connection>,
}

// Initialize database
fn init_database() -> Result<Connection> {
    let conn = Connection::open("vitasport.db")?;

    // Create products table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            sku TEXT UNIQUE NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            min_stock INTEGER NOT NULL DEFAULT 5,
            description TEXT
        )",
        [],
    )?;

    // Create sales table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            client TEXT NOT NULL,
            total REAL NOT NULL,
            status TEXT NOT NULL
        )",
        [],
    )?;

    // Create inventory movements table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS inventory_movements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            movement_type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            date TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )",
        [],
    )?;

    // Insert sample data if empty
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM products", [], |row| row.get(0))?;
    
    if count == 0 {
        conn.execute(
            "INSERT INTO products (name, sku, category, price, stock, min_stock, description) VALUES 
            ('Proteína Whey 2kg', 'PROT-001', 'Suplementos', 45000, 28, 10, 'Proteína de suero de leche premium'),
            ('Creatina Monohidrato 500g', 'CREA-001', 'Suplementos', 32000, 15, 5, 'Creatina pura micronizada'),
            ('BCAA 400g', 'BCAA-001', 'Aminoácidos', 28000, 42, 10, 'Aminoácidos ramificados 2:1:1'),
            ('Pre-Workout 300g', 'PRE-001', 'Energéticos', 38000, 8, 5, 'Fórmula pre-entreno avanzada')",
            [],
        )?;
    }

    Ok(conn)
}

// Tauri commands
#[tauri::command]
fn get_products(state: State<AppState>) -> Result<Vec<Product>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, sku, category, price, stock, min_stock, description FROM products")
        .map_err(|e| e.to_string())?;

    let products = stmt
        .query_map([], |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                sku: row.get(2)?,
                category: row.get(3)?,
                price: row.get(4)?,
                stock: row.get(5)?,
                min_stock: row.get(6)?,
                description: row.get(7)?,
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
        "INSERT INTO products (name, sku, category, price, stock, min_stock, description) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        [
            &product.name,
            &product.sku,
            &product.category,
            &product.price.to_string(),
            &product.stock.to_string(),
            &product.min_stock.to_string(),
            &product.description.unwrap_or_default(),
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn update_product(state: State<AppState>, product: Product) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE products SET name=?1, sku=?2, category=?3, price=?4, stock=?5, min_stock=?6, description=?7 
         WHERE id=?8",
        [
            &product.name,
            &product.sku,
            &product.category,
            &product.price.to_string(),
            &product.stock.to_string(),
            &product.min_stock.to_string(),
            &product.description.unwrap_or_default(),
            &product.id.unwrap().to_string(),
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
fn get_low_stock_products(state: State<AppState>) -> Result<Vec<Product>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, sku, category, price, stock, min_stock, description 
                  FROM products WHERE stock <= min_stock")
        .map_err(|e| e.to_string())?;

    let products = stmt
        .query_map([], |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                sku: row.get(2)?,
                category: row.get(3)?,
                price: row.get(4)?,
                stock: row.get(5)?,
                min_stock: row.get(6)?,
                description: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(products)
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
            get_low_stock_products,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
