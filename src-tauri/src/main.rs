#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, State};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::fs;
use std::path::PathBuf;
use rusqlite::{Connection, Result as SqliteResult, params};

// Estado global de la aplicación
struct AppState {
    db: Mutex<Option<Connection>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ApiResponse {
    success: bool,
    data: Option<serde_json::Value>,
    message: Option<String>,
}

// Inicializar base de datos SQLite
fn init_database(app_handle: &tauri::AppHandle) -> Result<Connection, String> {
    let app_data_dir = app_handle.path_resolver()
        .app_data_dir()
        .ok_or("No se pudo obtener directorio de datos")?;
    
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Error creando directorio: {}", e))?;
    
    let db_path = app_data_dir.join("vitasport.db");
    let conn = Connection::open(&db_path)
        .map_err(|e| format!("Error abriendo base de datos: {}", e))?;
    
    // Crear tablas si no existen
    conn.execute(
        "CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            nombre TEXT NOT NULL,
            email TEXT,
            rol TEXT DEFAULT 'usuario',
            activo BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| format!("Error creando tabla usuarios: {}", e))?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10,2) NOT NULL,
            stock INTEGER DEFAULT 0,
            stock_minimo INTEGER DEFAULT 5,
            categoria TEXT,
            imagen_url TEXT,
            activo BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    ).map_err(|e| format!("Error creando tabla productos: {}", e))?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS stock_movements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            tipo TEXT NOT NULL,
            cantidad INTEGER NOT NULL,
            motivo TEXT,
            usuario_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos (id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        )",
        [],
    ).map_err(|e| format!("Error creando tabla stock_movements: {}", e))?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            precio_unitario DECIMAL(10,2) NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            usuario_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos (id),
            FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        )",
        [],
    ).map_err(|e| format!("Error creando tabla ventas: {}", e))?;
    
    // Crear usuario admin por defecto si no existe
    let admin_exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM usuarios WHERE username = 'admin')",
        [],
        |row| row.get(0)
    ).unwrap_or(false);
    
    if !admin_exists {
        let password_hash = bcrypt::hash("admin", bcrypt::DEFAULT_COST)
            .map_err(|e| format!("Error hasheando password: {}", e))?;
        
        conn.execute(
            "INSERT INTO usuarios (username, password_hash, nombre, email, rol) VALUES (?, ?, ?, ?, ?)",
            params!["admin", &password_hash, "Administrador", "admin@vitasport.com", "admin"]
        ).map_err(|e| format!("Error creando usuario admin: {}", e))?;
    }
    
    Ok(conn)
}

// --- Comandos de Autenticación ---
#[tauri::command]
async fn login(username: String, password: String) -> Result<ApiResponse, String> {
    let body = serde_json::json!({
        "username": username,
        "password": password
    });
    api_request("POST", "/usuarios/login", Some(body)).await
}

#[tauri::command]
async fn verify_token(token: String) -> Result<ApiResponse, String> {
    let body = serde_json::json!({ "token": token });
    api_request("POST", "/usuarios/verify", Some(body)).await
}

#[tauri::command]
async fn save_token(token: String) -> Result<(), String> {
    // Guardar token en archivo local
    let app_data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or("No se pudo obtener directorio de datos")?;
    let token_path = app_data_dir.join("session.json");
    
    let token_data = serde_json::json!({ "token": token });
    fs::write(&token_path, serde_json::to_string(&token_data)?)
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
async fn get_token() -> Result<Option<String>, String> {
    let app_data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or("No se pudo obtener directorio de datos")?;
    let token_path = app_data_dir.join("session.json");
    
    if token_path.exists() {
        let content = fs::read_to_string(&token_path).map_err(|e| e.to_string())?;
        let data: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        Ok(data["token"].as_str().map(|s| s.to_string()))
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn clear_token() -> Result<(), String> {
    let app_data_dir = tauri::api::path::app_data_dir(&tauri::Config::default())
        .ok_or("No se pudo obtener directorio de datos")?;
    let token_path = app_data_dir.join("session.json");
    
    if token_path.exists() {
        fs::remove_file(&token_path).map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
async fn get_current_user() -> Result<Option<serde_json::Value>, String> {
    if let Some(token) = get_token().await? {
        let verification = verify_token(token).await?;
        if verification.success {
            Ok(verification.data)
        } else {
            Ok(None)
        }
    } else {
        Ok(None)
    }
}

// --- Comandos de Productos ---
#[tauri::command]
async fn get_productos() -> Result<ApiResponse, String> {
    api_request("GET", "/productos", None).await
}

#[tauri::command]
async fn get_producto_by_id(id: i32) -> Result<ApiResponse, String> {
    api_request("GET", &format!("/productos/{}", id), None).await
}

#[tauri::command]
async fn create_producto(data: serde_json::Value) -> Result<ApiResponse, String> {
    api_request("POST", "/productos", Some(data)).await
}

#[tauri::command]
async fn update_producto(id: i32, data: serde_json::Value) -> Result<ApiResponse, String> {
    api_request("PUT", &format!("/productos/{}", id), Some(data)).await
}

#[tauri::command]
async fn delete_producto(id: i32) -> Result<ApiResponse, String> {
    api_request("DELETE", &format!("/productos/{}", id), None).await
}

// --- Comandos de Usuarios ---
#[tauri::command]
async fn get_usuarios() -> Result<ApiResponse, String> {
    api_request("GET", "/usuarios", None).await
}

#[tauri::command]
async fn get_usuario_by_id(id: i32) -> Result<ApiResponse, String> {
    api_request("GET", &format!("/usuarios/{}", id), None).await
}

#[tauri::command]
async fn create_usuario(data: serde_json::Value) -> Result<ApiResponse, String> {
    api_request("POST", "/usuarios", Some(data)).await
}

#[tauri::command]
async fn update_usuario(id: i32, data: serde_json::Value) -> Result<ApiResponse, String> {
    api_request("PUT", &format!("/usuarios/{}", id), Some(data)).await
}

#[tauri::command]
async fn delete_usuario(id: i32) -> Result<ApiResponse, String> {
    api_request("DELETE", &format!("/usuarios/{}", id), None).await
}

// --- Comandos de Stock ---
#[tauri::command]
async fn get_stock_movements(product_id: i32) -> Result<ApiResponse, String> {
    api_request("GET", &format!("/stock/{}", product_id), None).await
}

#[tauri::command]
async fn create_stock_movement(data: serde_json::Value) -> Result<ApiResponse, String> {
    api_request("POST", "/stock", Some(data)).await
}

// --- Comandos de Ventas ---
#[tauri::command]
async fn get_ventas() -> Result<ApiResponse, String> {
    api_request("GET", "/ventas", None).await
}

#[tauri::command]
async fn create_venta(data: serde_json::Value) -> Result<ApiResponse, String> {
    api_request("POST", "/ventas", Some(data)).await
}

#[tauri::command]
async fn delete_venta(id: i32) -> Result<ApiResponse, String> {
    api_request("DELETE", &format!("/ventas/{}", id), None).await
}

// --- Comandos de Dashboard ---
#[tauri::command]
async fn get_dashboard_kpis() -> Result<ApiResponse, String> {
    api_request("GET", "/estadisticas/dashboard", None).await
}

#[tauri::command]
async fn get_sales_by_month() -> Result<ApiResponse, String> {
    api_request("GET", "/estadisticas/ventas-mes", None).await
}

#[tauri::command]
async fn get_sales_by_product() -> Result<ApiResponse, String> {
    api_request("GET", "/estadisticas/ventas-producto", None).await
}

// --- Comandos de Reportes ---
#[tauri::command]
async fn export_inventory_pdf() -> Result<ApiResponse, String> {
    api_request("GET", "/reportes/inventario/pdf", None).await
}

#[tauri::command]
async fn export_sales_pdf() -> Result<ApiResponse, String> {
    api_request("GET", "/reportes/ventas/pdf", None).await
}

#[tauri::command]
async fn export_general_pdf() -> Result<ApiResponse, String> {
    api_request("GET", "/reportes/general/pdf", None).await
}

#[tauri::command]
async fn export_sales_csv() -> Result<ApiResponse, String> {
    api_request("GET", "/ventas/csv", None).await
}

// --- Comandos Generales ---
#[tauri::command]
async fn select_image() -> Result<Option<String>, String> {
    // Implementación simple para selección de archivos
    // En Tauri v2 se maneja diferente
    let file_path = None;
    
    Ok(file_path.map(|p| p.to_string_lossy().to_string()))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Autenticación
            login,
            verify_token,
            save_token,
            get_token,
            clear_token,
            get_current_user,
            // Productos
            get_productos,
            get_producto_by_id,
            create_producto,
            update_producto,
            delete_producto,
            // Usuarios
            get_usuarios,
            get_usuario_by_id,
            create_usuario,
            update_usuario,
            delete_usuario,
            // Stock
            get_stock_movements,
            create_stock_movement,
            // Ventas
            get_ventas,
            create_venta,
            delete_venta,
            // Dashboard
            get_dashboard_kpis,
            get_sales_by_month,
            get_sales_by_product,
            // Reportes
            export_inventory_pdf,
            export_sales_pdf,
            export_general_pdf,
            export_sales_csv,
            // General
            select_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
