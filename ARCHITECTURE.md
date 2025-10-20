# 🏗️ Arquitectura de VitaSport

> Sistema de Gestión de Inventario con Tauri + React + SQLite

## 📐 Estructura del Proyecto

```
VitaSport/
├── src/                          # Frontend React
│   ├── components/              # Componentes reutilizables
│   │   ├── Layout.tsx           # Layout principal con sidebar
│   │   ├── Modal.tsx            # Modal reutilizable
│   │   ├── Button.tsx           # Botón personalizado
│   │   ├── StatCard.tsx         # Tarjeta de estadísticas
│   │   └── ProductForm.tsx      # Formulario completo de productos
│   │
│   ├── pages/                   # Páginas de la aplicación
│   │   ├── Dashboard.tsx        # Panel de control con estadísticas
│   │   ├── Products.tsx         # Gestión de inventario
│   │   ├── Sales.tsx            # Registro de ventas
│   │   ├── Reports.tsx          # Generación de reportes
│   │   └── Users.tsx            # Administración de usuarios
│   │
│   ├── App.tsx                  # Configuración de rutas
│   ├── main.tsx                 # Punto de entrada React
│   └── index.css                # Estilos globales + Tailwind
│
├── src-tauri/                   # Backend Rust/Tauri
│   ├── src/
│   │   └── main.rs              # Lógica del servidor y comandos
│   ├── Cargo.toml               # Dependencias de Rust
│   ├── tauri.conf.json          # Configuración de Tauri
│   └── icons/                   # Iconos de la aplicación
│
├── vitasport.db                 # Base de datos SQLite (se crea al ejecutar)
├── package.json                 # Dependencias de Node.js
├── vite.config.ts               # Configuración de Vite
└── tailwind.config.js           # Configuración de TailwindCSS
```

---

## 🔄 Flujo de Datos

### Modo Desarrollo (npm run dev)

```
Usuario Interactúa
    ↓
React Frontend (Vite)
    ↓
Detecta: __TAURI__ no existe
    ↓
Usa datos vacíos o mockups
    ↓
UI se muestra sin errores
```

### Modo Producción (npm run tauri:dev)

```
Usuario Interactúa
    ↓
React Frontend
    ↓
invoke('comando_tauri', params)
    ↓
Rust Backend (Tauri)
    ↓
SQLite Database
    ↓
Datos de retorno
    ↓
Actualiza UI
```

---

## 🗄️ Base de Datos SQLite

### Tablas

#### `users`
Gestión de usuarios del sistema
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    fullname TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### `products`
Catálogo completo de productos
```sql
CREATE TABLE products (
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
)
```

#### `stock_movements`
Registro de movimientos de inventario
```sql
CREATE TABLE stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    type TEXT NOT NULL,              -- "ingreso" o "egreso"
    quantity INTEGER NOT NULL,
    note TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
)
```

#### `sales`
Transacciones de venta
```sql
CREATE TABLE sales (
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
)
```

#### `purchases`
Registro de compras a proveedores
```sql
CREATE TABLE purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    supplier TEXT,
    purchase_price REAL,
    purchase_date TEXT,
    discount REAL,
    expected_replenish_days INTEGER,
    FOREIGN KEY (product_id) REFERENCES products(id)
)
```

---

## 🔌 Comandos Tauri (API Backend)

### Productos

```rust
// Obtener todos los productos
#[tauri::command]
fn get_products(state: State<AppState>) -> Result<Vec<Product>, String>

// Agregar nuevo producto
#[tauri::command]
fn add_product(state: State<AppState>, product: Product) -> Result<i64, String>

// Actualizar producto existente
#[tauri::command]
fn update_product(state: State<AppState>, product: Product) -> Result<(), String>

// Eliminar producto
#[tauri::command]
fn delete_product(state: State<AppState>, id: i32) -> Result<(), String>
```

### Movimientos de Stock

```rust
// Obtener movimientos recientes
#[tauri::command]
fn get_stock_movements(state: State<AppState>) -> Result<Vec<StockMovement>, String>

// Registrar nuevo movimiento
#[tauri::command]
fn add_stock_movement(state: State<AppState>, movement: StockMovement) -> Result<i64, String>
```

### Ventas

```rust
// Obtener ventas recientes
#[tauri::command]
fn get_sales(state: State<AppState>) -> Result<Vec<Sale>, String>

// Registrar nueva venta
#[tauri::command]
fn add_sale(state: State<AppState>, sale: Sale) -> Result<i64, String>
```

---

## 🎨 Sistema de Diseño

### Colores Principales

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
  }
}
```

### Componentes UI

- **Cards**: `rounded-xl shadow-sm border border-gray-100`
- **Buttons**: `rounded-lg transition-colors hover:...`
- **Tables**: Headers con `border-b border-gray-100`, rows con `hover:bg-gray-50/50`
- **Modals**: Overlay oscuro + card centrado con animación
- **Badges**: `rounded-full bg-{color}-50 text-{color}-700`

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo frontend (SIN compilar Rust)
npm run dev

# Desarrollo completo (CON backend Tauri)
npm run tauri:dev

# Compilar para producción
npm run tauri:build

# Solo compilar frontend
npm run build
```

---

## 🔐 Detección de Modo de Ejecución

Todas las páginas detectan automáticamente el modo:

```typescript
if (typeof window !== 'undefined' && '__TAURI__' in window) {
    // MODO TAURI: Usar invoke() para llamar al backend
    const data = await invoke('get_products');
} else {
    // MODO DESARROLLO: Usar datos vacíos o mockups
    console.info('🚀 Modo desarrollo sin backend');
}
```

---

## 📝 Buenas Prácticas

### Para Desarrolladores

1. **Desarrollo rápido**: Usa `npm run dev` para cambios de UI
2. **Testing completo**: Usa `npm run tauri:dev` para probar backend
3. **Documentación**: Mantén comentarios JSDoc en funciones importantes
4. **TypeScript**: Define interfaces para todos los datos
5. **Manejo de errores**: Siempre usa try-catch con mensajes útiles

### Estructura de Código

```typescript
/**
 * Descripción de la función
 * 
 * @param {Type} param - Descripción del parámetro
 * @returns {ReturnType} Descripción del retorno
 */
const myFunction = async (param: Type): Promise<ReturnType> => {
    try {
        // Lógica principal
        if (isTauriAvailable()) {
            // Modo producción
        } else {
            // Modo desarrollo
        }
    } catch (error) {
        // Manejo de errores con mensajes claros
        console.error('❌ Error:', error);
    }
};
```

---

## 🐛 Debugging

### Consola del Navegador

- `✅` = Operación exitosa
- `❌` = Error
- `⚠️` = Advertencia
- `🚀` = Información de modo
- `💡` = Sugerencia

### Logs de Tauri

Los logs del backend Rust aparecen en la terminal donde ejecutas `npm run tauri:dev`

---

## 🔄 Próximas Funcionalidades

- [ ] Implementar gráficos con Chart.js
- [ ] Sistema de autenticación completo
- [ ] Exportación de reportes a PDF/Excel
- [ ] Modo offline con sincronización
- [ ] Notificaciones de escritorio
- [ ] Sistema de permisos por rol

---

## 👥 Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit: `git commit -m 'Add: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto.

## 👤 Autor

**VitaSport Team**
