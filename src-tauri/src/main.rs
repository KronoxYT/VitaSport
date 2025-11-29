// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use bcrypt::{hash, verify, DEFAULT_COST};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::api::path::download_dir;

// Database models
#[derive(Debug, Serialize, Deserialize)]
struct User {
    id: Option<i32>,
    username: String,
    password_hash: String,
    role: String,
    fullname: Option<String>,
}

#[tauri::command]
fn get_sales_by_product(
    state: State<AppState>,
    start_date: Option<String>,
    end_date: Option<String>,
    order_by: Option<String>,
    category: Option<String>,
    limit: Option<i32>,
) -> Result<Vec<SalesByProduct>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let lim = limit.unwrap_or(5);
    let order_col = match order_by.as_deref() {
        Some("qty") => "total_qty",
        _ => "total_revenue",
    };
    let sql = format!(
        "SELECT s.product_id, COALESCE(p.name, '') as name,
                COALESCE(SUM(s.quantity),0) as total_qty,
                COALESCE(SUM(s.sale_price),0.0) as total_revenue
         FROM sales s
         LEFT JOIN products p ON p.id = s.product_id
         WHERE (?1 IS NULL OR substr(s.sale_date,1,10) >= ?1)
           AND (?2 IS NULL OR substr(s.sale_date,1,10) <= ?2)
           AND (?3 IS NULL OR p.category = ?3)
         GROUP BY s.product_id, name
         ORDER BY {} DESC
         LIMIT ?4",
        order_col
    );
    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![start_date, end_date, category, lim], |row| {
            Ok(SalesByProduct {
                product_id: row.get(0)?,
                name: row.get(1)?,
                total_qty: row.get(2)?,
                total_revenue: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(rows)
}

#[derive(Debug, Serialize, Deserialize)]
struct SalesTotals {
    total_units: i64,
    total_revenue: f64,
}

#[tauri::command]
fn get_sales_totals(
    state: State<AppState>,
    start_date: Option<String>,
    end_date: Option<String>,
    category: Option<String>,
) -> Result<SalesTotals, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT COALESCE(SUM(s.quantity),0) as total_units,
                    COALESCE(SUM(s.sale_price),0.0) as total_revenue
             FROM sales s
             LEFT JOIN products p ON p.id = s.product_id
             WHERE (?1 IS NULL OR substr(s.sale_date,1,10) >= ?1)
               AND (?2 IS NULL OR substr(s.sale_date,1,10) <= ?2)
               AND (?3 IS NULL OR p.category = ?3)",
        )
        .map_err(|e| e.to_string())?;
    let totals = stmt
        .query_row(rusqlite::params![start_date, end_date, category], |row| {
            Ok(SalesTotals {
                total_units: row.get(0)?,
                total_revenue: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;
    Ok(totals)
}

#[tauri::command]
fn get_sales_trend(state: State<AppState>, days: Option<i32>) -> Result<Vec<SalesTrendPoint>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let d = days.unwrap_or(7);
    let modifier = format!("-{} day", d.max(0));
    let mut stmt = conn
        .prepare(
            "SELECT substr(sale_date,1,10) as day,
                    COUNT(*) as sales_count,
                    COALESCE(SUM(sale_price),0.0) as total_revenue
             FROM sales
             WHERE substr(sale_date,1,10) >= date('now', ?1)
             GROUP BY day
             ORDER BY day ASC",
        )
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(rusqlite::params![modifier], |row| {
            Ok(SalesTrendPoint {
                date: row.get(0)?,
                sales_count: row.get(1)?,
                total_revenue: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(rows)
}
#[derive(Debug, Serialize, Deserialize)]
struct StockBalance {
    product_id: i32,
    current_stock: i64,
}

#[tauri::command]
fn get_stock_balances(state: State<AppState>) -> Result<Vec<StockBalance>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT product_id, COALESCE(SUM(CASE WHEN type='ingreso' THEN quantity WHEN type='egreso' THEN -quantity ELSE 0 END),0) as balance FROM stock_movements GROUP BY product_id")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(StockBalance {
                product_id: row.get(0)?,
                current_stock: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(rows)
}

#[tauri::command]
fn export_sales_report(state: State<AppState>, start_date: Option<String>, end_date: Option<String>) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut rows: Vec<(i32, i32, i32, f64, Option<f64>, Option<String>, String, Option<i32>)> = Vec::new();
    if start_date.is_some() && end_date.is_some() {
        let mut stmt = conn
            .prepare("SELECT id, product_id, quantity, sale_price, discount, channel, sale_date, created_by FROM sales WHERE substr(sale_date,1,10) BETWEEN ?1 AND ?2 ORDER BY sale_date DESC")
            .map_err(|e| e.to_string())?;
        let iter = stmt
            .query_map(rusqlite::params![start_date.as_ref().unwrap(), end_date.as_ref().unwrap()], |row| {
                Ok((
                    row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?, row.get(5)?, row.get(6)?, row.get(7)?,
                ))
            })
            .map_err(|e| e.to_string())?;
        for r in iter { rows.push(r.map_err(|e| e.to_string())?); }
    } else {
        let mut stmt = conn
            .prepare("SELECT id, product_id, quantity, sale_price, discount, channel, sale_date, created_by FROM sales ORDER BY sale_date DESC")
            .map_err(|e| e.to_string())?;
        let iter = stmt
            .query_map([], |row| {
                Ok((
                    row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?, row.get(5)?, row.get(6)?, row.get(7)?,
                ))
            })
            .map_err(|e| e.to_string())?;
        for r in iter { rows.push(r.map_err(|e| e.to_string())?); }
    }

    let mut csv = String::from("id,product_id,quantity,sale_price,discount,channel,sale_date,created_by\n");
    for (id, pid, qty, price, disc, channel, date, created_by) in rows {
        csv.push_str(&format!(
            "{},{},{},{:.2},{},{},{},{}\n",
            id,
            pid,
            qty,
            price,
            disc.map(|d| d.to_string()).unwrap_or_default(),
            channel.unwrap_or_default(),
            date,
            created_by.map(|c| c.to_string()).unwrap_or_default()
        ));
    }

    let base: PathBuf = download_dir().ok_or("No se pudo obtener carpeta Descargas")?;
    let out_dir = base.join("VitaSport");
    fs::create_dir_all(&out_dir).map_err(|e| e.to_string())?;
    let ts = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| e.to_string())?.as_secs();
    let path = out_dir.join(format!("sales_report_{}.csv", ts));
    fs::write(&path, csv).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn export_inventory_report(state: State<AppState>) -> Result<String, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, sku, name, sale_price, brand, category, presentation, flavor, weight, expiry_date, lot_number, min_stock, max_stock, location, status FROM products")
        .map_err(|e| e.to_string())?;

    let mut csv = String::from("id,sku,name,sale_price,brand,category,presentation,flavor,weight,expiry_date,lot_number,min_stock,max_stock,location,status,current_stock\n");
    let rows = stmt.query_map([], |row| {
        Ok((
            row.get::<_, i32>(0)?,
            row.get::<_, Option<String>>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, Option<f64>>(3)?,
            row.get::<_, Option<String>>(4)?,
            row.get::<_, Option<String>>(5)?,
            row.get::<_, Option<String>>(6)?,
            row.get::<_, Option<String>>(7)?,
            row.get::<_, Option<String>>(8)?,
            row.get::<_, Option<String>>(9)?,
            row.get::<_, Option<String>>(10)?,
            row.get::<_, Option<i32>>(11)?,
            row.get::<_, Option<i32>>(12)?,
            row.get::<_, Option<String>>(13)?,
            row.get::<_, Option<String>>(14)?,
        ))
    }).map_err(|e| e.to_string())?;

    for r in rows {
        let (id, sku, name, sale_price, brand, category, presentation, flavor, weight, expiry_date, lot_number, min_stock, max_stock, location, status) = r.map_err(|e| e.to_string())?;

        let ingreso: i64 = conn.query_row(
            "SELECT COALESCE(SUM(quantity),0) FROM stock_movements WHERE product_id=?1 AND type='ingreso'",
            rusqlite::params![id],
            |row| row.get(0),
        ).unwrap_or(0);
        let egreso: i64 = conn.query_row(
            "SELECT COALESCE(SUM(quantity),0) FROM stock_movements WHERE product_id=?1 AND type='egreso'",
            rusqlite::params![id],
            |row| row.get(0),
        ).unwrap_or(0);
        let current_stock = ingreso - egreso;

        csv.push_str(&format!(
            "{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}\n",
            id,
            sku.unwrap_or_default(),
            name,
            sale_price.map(|v| format!("{:.2}", v)).unwrap_or_default(),
            brand.unwrap_or_default(),
            category.unwrap_or_default(),
            presentation.unwrap_or_default(),
            flavor.unwrap_or_default(),
            weight.unwrap_or_default(),
            expiry_date.unwrap_or_default(),
            lot_number.unwrap_or_default(),
            min_stock.map(|v| v.to_string()).unwrap_or_default(),
            max_stock.map(|v| v.to_string()).unwrap_or_default(),
            location.unwrap_or_default(),
            status.unwrap_or_default(),
            current_stock,
        ));
    }

    let base: PathBuf = download_dir().ok_or("No se pudo obtener carpeta Descargas")?;
    let out_dir = base.join("VitaSport");
    fs::create_dir_all(&out_dir).map_err(|e| e.to_string())?;
    let ts = SystemTime::now().duration_since(UNIX_EPOCH).map_err(|e| e.to_string())?.as_secs();
    let path = out_dir.join(format!("inventory_report_{}.csv", ts));
    fs::write(&path, csv).map_err(|e| e.to_string())?;
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn export_all_reports(state: State<AppState>) -> Result<Vec<String>, String> {
    let mut paths = Vec::new();
    let inv = export_inventory_report(state.clone())?;
    paths.push(inv);
    let sales = export_sales_report(state, None, None)?;
    paths.push(sales);
    Ok(paths)
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
    max_stock: Option<i32>,
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
struct SalesByProduct {
    product_id: i32,
    name: String,
    total_qty: i64,
    total_revenue: f64,
}

#[derive(Debug, Serialize, Deserialize)]
struct SalesTrendPoint {
    date: String,
    sales_count: i64,
    total_revenue: f64,
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
            max_stock INTEGER,
            location TEXT,
            status TEXT
        )",
        [],
    )?;

    {
        let mut stmt = conn.prepare("PRAGMA table_info(products)")?;
        let mut rows = stmt.query_map([], |row| row.get::<_, String>(1))?;
        let mut col_names: Vec<String> = Vec::new();
        for r in rows {
            if let Ok(name) = r { col_names.push(name); }
        }
        if !col_names.iter().any(|c| c == "sale_price") {
            let _ = conn.execute("ALTER TABLE products ADD COLUMN sale_price REAL", []);
        }
        if !col_names.iter().any(|c| c == "max_stock") {
            let _ = conn.execute("ALTER TABLE products ADD COLUMN max_stock INTEGER", []);
        }
    }

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

    // Insertar usuario admin por defecto si no existe
    let user_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM users",
        [],
        |row| row.get(0)
    ).unwrap_or(0);
    
    if user_count == 0 {
        // Hash seguro de la contraseña "admin" con bcrypt
        let admin_password_hash = hash("admin", DEFAULT_COST).expect("Failed to hash password");
        
        conn.execute(
            "INSERT INTO users (username, password_hash, role, fullname) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params!["admin", admin_password_hash, "Administrador", "Administrador del Sistema"],
        )?;
        println!("✅ Usuario admin por defecto creado con contraseña encriptada");
    }

    Ok(conn)
}

// Tauri commands
#[tauri::command]
fn get_products(state: State<AppState>) -> Result<Vec<Product>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, sku, name, sale_price, brand, category, presentation, flavor, weight, image_path, expiry_date, lot_number, min_stock, max_stock, location, status FROM products")
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
                max_stock: row.get(13)?,
                location: row.get(14)?,
                status: row.get(15)?,
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

    if let Some(ref sku_val) = product.sku {
        let existing = conn.query_row(
            "SELECT id FROM products WHERE sku = ?1 LIMIT 1",
            rusqlite::params![sku_val],
            |row| row.get::<_, i32>(0),
        );
        match existing {
            Ok(_id) => {
                return Err("El SKU ya existe. Usa otro SKU o edita el producto existente.".to_string());
            }
            Err(rusqlite::Error::QueryReturnedNoRows) => {}
            Err(e) => return Err(e.to_string()),
        }
    }
    conn.execute(
        "INSERT INTO products (sku, name, sale_price, brand, category, presentation, flavor, weight, image_path, expiry_date, lot_number, min_stock, max_stock, location, status) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)",
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
            product.max_stock,
            product.location,
            product.status,
        ],
    )
    .map_err(|e| {
        let msg = e.to_string();
        if msg.contains("UNIQUE constraint failed: products.sku") {
            "El SKU ya existe. Usa otro SKU o edita el producto existente.".to_string()
        } else {
            msg
        }
    })?;

    let new_id = conn.last_insert_rowid();

    if let Some(max_qty) = product.max_stock {
        if max_qty > 0 {
            let _ = conn.execute(
                "INSERT INTO stock_movements (product_id, type, quantity, note, created_by) VALUES (?1, 'ingreso', ?2, ?3, ?4)",
                rusqlite::params![new_id as i32, max_qty, Option::<String>::None, Option::<i32>::None],
            );
        }
    }

    Ok(new_id)
}

#[tauri::command]
fn update_product(state: State<AppState>, product: Product) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE products SET sku=?1, name=?2, sale_price=?3, brand=?4, category=?5, presentation=?6, flavor=?7, weight=?8, image_path=?9, expiry_date=?10, lot_number=?11, min_stock=?12, max_stock=?13, location=?14, status=?15 
         WHERE id=?16",
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
            product.max_stock,
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
    conn.execute("BEGIN IMMEDIATE TRANSACTION", []).map_err(|e| e.to_string())?;
    let result: Result<i64, String> = (|| {
        let current_stock: i64 = conn
            .query_row(
                "SELECT COALESCE(SUM(CASE WHEN type='ingreso' THEN quantity WHEN type='egreso' THEN -quantity ELSE 0 END),0) FROM stock_movements WHERE product_id=?1",
                rusqlite::params![sale.product_id],
                |row| row.get(0),
            )
            .unwrap_or(0);
        if (sale.quantity as i64) > current_stock {
            return Err(format!("Stock insuficiente. Disponible: {}, solicitado: {}", current_stock, sale.quantity));
        }
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
        ).map_err(|e| e.to_string())?;
        let sale_id = conn.last_insert_rowid();
        conn.execute(
            "INSERT INTO stock_movements (product_id, type, quantity, note, created_by)
             VALUES (?1, 'egreso', ?2, ?3, ?4)",
            rusqlite::params![
                sale.product_id,
                sale.quantity,
                Option::<String>::None,
                sale.created_by,
            ],
        ).map_err(|e| e.to_string())?;
        Ok(sale_id)
    })();
    match result {
        Ok(sale_id) => {
            conn.execute("COMMIT", []).map_err(|e| e.to_string())?;
            Ok(sale_id)
        }
        Err(err) => {
            let _ = conn.execute("ROLLBACK", []);
            Err(err)
        }
    }
}

// ============================================
// USER COMMANDS
// ============================================

// ... (rest of the code remains the same)
#[tauri::command]
fn get_users(state: State<AppState>) -> Result<Vec<User>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, username, role, fullname FROM users")
        .map_err(|e| e.to_string())?;

    let users = stmt
        .query_map([], |row| {
            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: String::new(), // No exponer contraseñas
                role: row.get(2)?,
                fullname: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(users)
}

#[tauri::command]
fn add_user(state: State<AppState>, username: String, fullname: String, password: String, role: String) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    // Hash seguro de la contraseña con bcrypt
    let password_hash = hash(&password, DEFAULT_COST).map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT INTO users (username, fullname, password_hash, role) 
         VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![
            username,
            fullname,
            password_hash,
            role,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
fn update_user(state: State<AppState>, id: i32, username: String, fullname: String, role: String, password: Option<String>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    if let Some(pwd) = password {
        // Si se proporciona contraseña, hashearla y actualizarla
        let password_hash = hash(&pwd, DEFAULT_COST).map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE users SET username = ?1, fullname = ?2, role = ?3, password_hash = ?4, updated_at = CURRENT_TIMESTAMP WHERE id = ?5",
            rusqlite::params![username, fullname, role, password_hash, id],
        )
        .map_err(|e| e.to_string())?;
    } else {
        // Solo actualizar username, fullname y role (mantener contraseña actual)
        conn.execute(
            "UPDATE users SET username = ?1, fullname = ?2, role = ?3, updated_at = CURRENT_TIMESTAMP WHERE id = ?4",
            rusqlite::params![username, fullname, role, id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
fn delete_user(state: State<AppState>, id: i32) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM users WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Verifica las credenciales de login contra la base de datos
/// Retorna el usuario si las credenciales son correctas, error si no
#[tauri::command]
fn verify_login(state: State<AppState>, username: String, password: String) -> Result<User, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    // Buscar usuario por username
    let result = conn.query_row(
        "SELECT id, username, password_hash, role, fullname FROM users WHERE username = ?1",
        rusqlite::params![username],
        |row| {
            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: row.get(2)?,
                role: row.get(3)?,
                fullname: row.get(4)?,
            })
        },
    );
    
    match result {
        Ok(user) => {
            // Verificar contraseña con bcrypt
            let is_valid = verify(&password, &user.password_hash)
                .map_err(|e| format!("Error verificando contraseña: {}", e))?;
            
            if is_valid {
                // No enviar el hash de contraseña al frontend
                Ok(User {
                    id: user.id,
                    username: user.username,
                    password_hash: String::new(), // Vacío por seguridad
                    role: user.role,
                    fullname: user.fullname,
                })
            } else {
                Err("Contraseña incorrecta".to_string())
            }
        }
        Err(_) => Err("Usuario no encontrado".to_string()),
    }
}

fn main() {
    let db = init_database().expect("Failed to initialize database");

    tauri::Builder::default()
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
            get_sales_by_product,
            get_sales_trend,
            get_sales_totals,
            get_stock_balances,
            export_inventory_report,
            export_sales_report,
            export_all_reports,
            get_users,
            add_user,
            update_user,
            delete_user,
            verify_login,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
