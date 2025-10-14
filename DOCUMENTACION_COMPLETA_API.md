# VitaSport - Documentación Completa de APIs y Componentes

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [APIs REST del Backend](#apis-rest-del-backend)
4. [Controladores del Servidor](#controladores-del-servidor)
5. [Componentes React del Frontend](#componentes-react-del-frontend)
6. [Páginas y Vistas](#páginas-y-vistas)
7. [Utilidades y Helpers](#utilidades-y-helpers)
8. [Configuración y Despliegue](#configuración-y-despliegue)
9. [Ejemplos de Uso](#ejemplos-de-uso)
10. [Casos de Prueba](#casos-de-prueba)

---

## Introducción

VitaSport es un sistema de gestión de inventario desarrollado con Node.js/Express en el backend y React en el frontend. El sistema permite gestionar productos, ventas, usuarios y generar reportes en PDF.

### Tecnologías Utilizadas

**Backend:**
- Node.js + Express.js
- SQLite con Knex.js
- JWT para autenticación
- PDFMake para reportes
- bcrypt para encriptación

**Frontend:**
- React 18.2.0
- React Router DOM
- Tailwind CSS
- Framer Motion
- Chart.js

---

## Arquitectura del Sistema

```
VitaSport/
├── src/
│   ├── controllers/     # Lógica de negocio
│   ├── routes/         # Definición de rutas
│   ├── database/       # Configuración de BD
│   ├── main/          # Aplicación Electron
│   └── renderer/      # Frontend React
│       └── react-app/
│           ├── src/
│           │   ├── components/  # Componentes reutilizables
│           │   ├── pages/      # Páginas principales
│           │   ├── context/    # Context API
│           │   └── api.js      # Cliente HTTP
└── src-tauri/         # Aplicación Tauri (alternativa)
```

---

## APIs REST del Backend

### Base URL
```
http://localhost:3001/api
```

### Autenticación

#### POST /api/login
Autentica a un usuario y devuelve un token JWT.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/logout
Cierra la sesión del usuario.

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada"
}
```

### Gestión de Productos

#### GET /api/productos
Obtiene todos los productos con su stock actual.

**Query Parameters:**
- `search` (opcional): Filtrar por nombre
- `category` (opcional): Filtrar por categoría

**Response:**
```json
{
  "success": true,
  "productos": [
    {
      "id": 1,
      "name": "Proteína Whey",
      "sku": "PROT001",
      "category": "Proteínas",
      "brand": "Marca X",
      "price": 89.99,
      "sale_price": 99.99,
      "stock_real": 15,
      "expiry_date": "2024-12-31"
    }
  ]
}
```

#### GET /api/productos/:id
Obtiene un producto específico por ID.

**Response:**
```json
{
  "success": true,
  "producto": {
    "id": 1,
    "name": "Proteína Whey",
    "sku": "PROT001",
    "category": "Proteínas",
    "brand": "Marca X",
    "price": 89.99,
    "sale_price": 99.99,
    "expiry_date": "2024-12-31"
  }
}
```

#### POST /api/productos
Crea un nuevo producto (requiere autenticación de administrador).

**Request:**
```json
{
  "name": "Creatina Monohidrato",
  "sku": "CREA001",
  "category": "Suplementos",
  "brand": "Marca Y",
  "price": 29.99,
  "sale_price": 34.99,
  "expiry_date": "2025-06-30"
}
```

**Response:**
```json
{
  "success": true,
  "id": 2
}
```

#### PUT /api/productos/:id
Actualiza un producto existente.

**Request:**
```json
{
  "name": "Creatina Monohidrato Premium",
  "price": 32.99
}
```

#### DELETE /api/productos/:id
Elimina un producto.

**Response:**
```json
{
  "success": true
}
```

### Gestión de Usuarios

#### GET /api/usuarios
Obtiene todos los usuarios (solo administradores).

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "username": "admin",
      "role": "Administrador",
      "fullname": "Administrador del Sistema",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/usuarios
Crea un nuevo usuario.

**Request:**
```json
{
  "username": "vendedor1",
  "password": "password123",
  "role": "Vendedor",
  "fullname": "Juan Pérez"
}
```

#### PUT /api/usuarios/:id
Actualiza un usuario existente.

#### DELETE /api/usuarios/:id
Elimina un usuario.

### Gestión de Stock

#### GET /api/stock-movements/:productId
Obtiene el historial de movimientos de stock para un producto.

**Response:**
```json
{
  "success": true,
  "movements": [
    {
      "id": 1,
      "producto_id": 1,
      "tipo_movimiento": "entrada",
      "cantidad": 50,
      "motivo": "Compra a proveedor",
      "fecha": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### POST /api/stock-movements
Registra un nuevo movimiento de stock.

**Request:**
```json
{
  "producto_id": 1,
  "tipo_movimiento": "entrada",
  "cantidad": 25,
  "motivo": "Reposición de inventario",
  "user_id": 1
}
```

**Tipos de movimiento:**
- `entrada`: Aumenta el stock
- `salida`: Disminuye el stock
- `ajuste`: Establece el stock a un valor específico

### Gestión de Ventas

#### GET /api/ventas
Obtiene todas las ventas registradas.

**Response:**
```json
{
  "success": true,
  "ventas": [
    {
      "id": 1,
      "product_id": 1,
      "quantity": 2,
      "sale_price": 99.99,
      "discount": 0,
      "channel": "Tienda física",
      "sale_date": "2024-01-15T14:30:00.000Z",
      "product_name": "Proteína Whey",
      "vendedor": "admin"
    }
  ]
}
```

#### POST /api/ventas
Registra una nueva venta.

**Request:**
```json
{
  "product_id": 1,
  "quantity": 2,
  "sale_price": 99.99,
  "discount": 5.00,
  "channel": "Online",
  "sale_date": "2024-01-15T14:30:00.000Z",
  "created_by": 1
}
```

#### DELETE /api/ventas/:id
Elimina una venta.

#### GET /api/ventas/csv
Exporta las ventas en formato CSV.

### Inventario

#### GET /api/inventario
Obtiene el inventario actual con stock real calculado.

**Response:**
```json
{
  "success": true,
  "inventario": [
    {
      "id": 1,
      "name": "Proteína Whey",
      "sku": "PROT001",
      "category": "Proteínas",
      "stock_real": 15
    }
  ]
}
```

### Reportes

#### GET /api/reportes/inventario/pdf
Genera un reporte de inventario en PDF.

#### GET /api/reportes/ventas/pdf
Genera un reporte de ventas en PDF.

#### GET /api/reportes/general/pdf
Genera un reporte general con estadísticas.

### Estadísticas

#### GET /api/estadisticas/ventas-producto
Obtiene estadísticas de ventas por producto.

**Response:**
```json
{
  "success": true,
  "datos": [
    {
      "producto": "Proteína Whey",
      "total": 25
    }
  ]
}
```

#### GET /api/estadisticas/ventas-mes
Obtiene estadísticas de ventas por mes.

**Response:**
```json
{
  "success": true,
  "datos": [
    {
      "mes": "2024-01",
      "total": 150
    }
  ]
}
```

### Alertas

#### GET /api/alertas/stock-bajo
Obtiene productos con stock bajo.

**Response:**
```json
{
  "success": true,
  "alertas": [
    {
      "id": 1,
      "name": "Proteína Whey",
      "stock_real": 3,
      "min_stock": 10
    }
  ]
}
```

---

## Controladores del Servidor

### ProductController

**Ubicación:** `src/controllers/productController.js`

**Funciones principales:**
- `getAllProducts()`: Obtiene todos los productos con stock calculado
- `getProductById(id)`: Obtiene un producto por ID
- `createProduct(data)`: Crea un nuevo producto
- `updateProduct(id, data)`: Actualiza un producto existente
- `deleteProduct(id)`: Elimina un producto

**Ejemplo de uso:**
```javascript
const { getAllProducts, createProduct } = require('./controllers/productController');

// Obtener todos los productos
const productos = await getAllProducts(req, res);

// Crear un nuevo producto
const nuevoProducto = {
  name: "Creatina",
  sku: "CREA001",
  category: "Suplementos",
  price: 29.99
};
await createProduct({ body: nuevoProducto }, res);
```

### UserController

**Ubicación:** `src/controllers/userController.js`

**Funciones principales:**
- `getAllUsers()`: Obtiene todos los usuarios
- `getUserById(id)`: Obtiene un usuario por ID
- `createUser(data)`: Crea un nuevo usuario
- `updateUser(id, data)`: Actualiza un usuario
- `deleteUser(id)`: Elimina un usuario
- `loginUser(username, password)`: Autentica un usuario
- `verifyToken(token)`: Verifica un token JWT

**Ejemplo de uso:**
```javascript
const { loginUser, createUser } = require('./controllers/userController');

// Autenticar usuario
const resultado = await loginUser('admin', 'password123');
if (resultado.success) {
  console.log('Token:', resultado.token);
}

// Crear usuario
const nuevoUsuario = {
  username: 'vendedor1',
  password: 'password123',
  role: 'Vendedor',
  fullname: 'Juan Pérez'
};
await createUser({ body: nuevoUsuario }, res);
```

### SalesController

**Ubicación:** `src/controllers/salesController.js`

**Funciones principales:**
- `getAllSales()`: Obtiene todas las ventas
- `createSale(data)`: Registra una nueva venta
- `deleteSale(id)`: Elimina una venta
- `exportSalesCsv()`: Exporta ventas a CSV

**Ejemplo de uso:**
```javascript
const { createSale, exportSalesCsv } = require('./controllers/salesController');

// Registrar venta
const venta = {
  product_id: 1,
  quantity: 2,
  sale_price: 99.99,
  discount: 0,
  channel: 'Online',
  created_by: 1
};
await createSale({ body: venta }, res);

// Exportar a CSV
await exportSalesCsv(req, res);
```

### InventoryController

**Ubicación:** `src/controllers/inventoryController.js`

**Funciones principales:**
- `getInventory()`: Obtiene el inventario con stock real

**Ejemplo de uso:**
```javascript
const { getInventory } = require('./controllers/inventoryController');

// Obtener inventario
await getInventory(req, res);
```

### StockController

**Ubicación:** `src/controllers/stockController.js`

**Funciones principales:**
- `getStockMovementsByProductId(productId)`: Obtiene movimientos de stock
- `createStockMovement(data)`: Crea un movimiento de stock

**Ejemplo de uso:**
```javascript
const { createStockMovement } = require('./controllers/stockController');

// Crear movimiento de stock
const movimiento = {
  producto_id: 1,
  tipo_movimiento: 'entrada',
  cantidad: 50,
  motivo: 'Compra a proveedor',
  user_id: 1
};
await createStockMovement({ body: movimiento }, res);
```

### ReportsController

**Ubicación:** `src/controllers/reportsController.js`

**Funciones principales:**
- `getInventoryPdf()`: Genera PDF de inventario
- `getSalesPdf()`: Genera PDF de ventas
- `getGeneralPdf()`: Genera PDF general

**Ejemplo de uso:**
```javascript
const { getInventoryPdf, getSalesPdf } = require('./controllers/reportsController');

// Generar reporte de inventario
await getInventoryPdf(req, res);

// Generar reporte de ventas
await getSalesPdf(req, res);
```

### StatisticsController

**Ubicación:** `src/controllers/statisticsController.js`

**Funciones principales:**
- `getSalesByProduct()`: Estadísticas de ventas por producto
- `getSalesByMonth()`: Estadísticas de ventas por mes

**Ejemplo de uso:**
```javascript
const { getSalesByProduct, getSalesByMonth } = require('./controllers/statisticsController');

// Obtener estadísticas por producto
await getSalesByProduct(req, res);

// Obtener estadísticas por mes
await getSalesByMonth(req, res);
```

---

## Componentes React del Frontend

### Componentes de UI

#### Button

**Ubicación:** `src/renderer/react-app/src/components/ui/Button.jsx`

**Props:**
- `children`: Contenido del botón
- `variant`: Tipo de botón (`primary`, `secondary`, `danger`)
- `className`: Clases CSS adicionales
- `...props`: Props adicionales del elemento button

**Ejemplo de uso:**
```jsx
import { Button } from './components/ui/Button';

<Button variant="primary" onClick={handleClick}>
  Guardar
</Button>

<Button variant="danger" onClick={handleDelete}>
  Eliminar
</Button>
```

#### Input

**Ubicación:** `src/renderer/react-app/src/components/ui/Input.jsx`

**Props:**
- `type`: Tipo de input (`text`, `email`, `password`, etc.)
- `placeholder`: Texto placeholder
- `value`: Valor controlado
- `onChange`: Función de cambio
- `className`: Clases CSS adicionales

**Ejemplo de uso:**
```jsx
import { Input } from './components/ui/Input';

<Input
  type="text"
  placeholder="Nombre del producto"
  value={productName}
  onChange={(e) => setProductName(e.target.value)}
/>
```

#### Card

**Ubicación:** `src/renderer/react-app/src/components/ui/Card.jsx`

**Props:**
- `children`: Contenido de la tarjeta
- `className`: Clases CSS adicionales

**Ejemplo de uso:**
```jsx
import { Card } from './components/ui/Card';

<Card className="p-6">
  <h3>Título</h3>
  <p>Contenido de la tarjeta</p>
</Card>
```

### Componentes de Layout

#### Header

**Ubicación:** `src/renderer/react-app/src/components/Header.jsx`

**Props:**
- `user`: Objeto con información del usuario
- `onLogout`: Función para cerrar sesión

**Ejemplo de uso:**
```jsx
import { Header } from './components/Header';

<Header 
  user={{ name: 'Juan Pérez', role: 'Administrador' }}
  onLogout={handleLogout}
/>
```

#### Sidebar

**Ubicación:** `src/renderer/react-app/src/components/Sidebar.jsx`

**Props:**
- `currentPath`: Ruta actual
- `onNavigate`: Función de navegación

**Ejemplo de uso:**
```jsx
import { Sidebar } from './components/Sidebar';

<Sidebar 
  currentPath={location.pathname}
  onNavigate={(path) => navigate(path)}
/>
```

#### Layout

**Ubicación:** `src/renderer/react-app/src/components/Layout.jsx`

**Props:**
- `children`: Contenido principal

**Ejemplo de uso:**
```jsx
import { Layout } from './components/Layout';

<Layout>
  <Dashboard />
</Layout>
```

### Componentes de Datos

#### InventoryTable

**Ubicación:** `src/renderer/react-app/src/components/InventoryTable.jsx`

**Props:**
- `data`: Array de productos
- `onEdit`: Función para editar producto
- `onDelete`: Función para eliminar producto

**Ejemplo de uso:**
```jsx
import { InventoryTable } from './components/InventoryTable';

<InventoryTable
  data={productos}
  onEdit={(producto) => setProductoEditando(producto)}
  onDelete={(producto) => eliminarProducto(producto.id)}
/>
```

#### StatsCard

**Ubicación:** `src/renderer/react-app/src/components/StatsCard.jsx`

**Props:**
- `title`: Título de la tarjeta
- `value`: Valor principal
- `trend`: Tendencia (opcional)
- `icon`: Componente de icono (opcional)
- `color`: Color del tema

**Ejemplo de uso:**
```jsx
import { StatsCard } from './components/StatsCard';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

<StatsCard
  title="Ventas Totales"
  value="1,234"
  trend={12.5}
  icon={ShoppingCartIcon}
  color="green"
/>
```

### Componentes de Animación

#### LoadingDots

**Ubicación:** `src/renderer/react-app/src/components/animations/LoadingDots.jsx`

**Props:**
- `size`: Tamaño de los puntos (`sm`, `md`, `lg`)
- `color`: Color de los puntos

**Ejemplo de uso:**
```jsx
import { LoadingDots } from './components/animations/LoadingDots';

<LoadingDots size="md" color="blue" />
```

#### PageTransition

**Ubicación:** `src/renderer/react-app/src/components/animations/PageTransition.jsx`

**Props:**
- `children`: Contenido a animar

**Ejemplo de uso:**
```jsx
import { PageTransition } from './components/animations/PageTransition';

<PageTransition>
  <Dashboard />
</PageTransition>
```

#### Toast

**Ubicación:** `src/renderer/react-app/src/components/animations/Toast.jsx`

**Props:**
- `message`: Mensaje a mostrar
- `type`: Tipo de toast (`success`, `error`, `warning`, `info`)
- `duration`: Duración en milisegundos
- `onClose`: Función de cierre

**Ejemplo de uso:**
```jsx
import { Toast } from './components/animations/Toast';

<Toast
  message="Producto guardado exitosamente"
  type="success"
  duration={3000}
  onClose={() => setShowToast(false)}
/>
```

---

## Páginas y Vistas

### Login

**Ubicación:** `src/renderer/react-app/src/pages/Login.jsx`

**Funcionalidades:**
- Formulario de autenticación
- Validación de credenciales
- Redirección después del login
- Manejo de errores

**Ejemplo de uso:**
```jsx
import Login from './pages/Login';

// En el router
<Route path="/login" element={<Login />} />
```

### Dashboard

**Ubicación:** `src/renderer/react-app/src/pages/Dashboard.jsx`

**Funcionalidades:**
- Estadísticas generales
- Contador de productos
- Contador de ventas
- Alertas de stock bajo

**Estado:**
```javascript
const [productosCount, setProductosCount] = useState('--');
const [ventasCount, setVentasCount] = useState('--');
const [alertas, setAlertas] = useState([]);
```

### Inventario

**Ubicación:** `src/renderer/react-app/src/pages/Inventario.jsx`

**Funcionalidades:**
- Lista de productos
- Visualización de stock
- Filtros y búsqueda
- Acciones de edición/eliminación

**Estado:**
```javascript
const [productos, setProductos] = useState([]);
const [filtros, setFiltros] = useState({
  search: '',
  category: ''
});
```

### Ventas

**Ubicación:** `src/renderer/react-app/src/pages/Ventas.jsx`

**Funcionalidades:**
- Lista de ventas
- Registro de nuevas ventas
- Filtros por fecha
- Exportación a CSV

**Estado:**
```javascript
const [ventas, setVentas] = useState([]);
const [nuevaVenta, setNuevaVenta] = useState({
  product_id: '',
  quantity: 1,
  sale_price: 0,
  discount: 0
});
```

### Usuarios

**Ubicación:** `src/renderer/react-app/src/pages/Usuarios.jsx`

**Funcionalidades:**
- Lista de usuarios
- Creación de usuarios
- Edición de usuarios
- Eliminación de usuarios
- Gestión de roles

**Estado:**
```javascript
const [usuarios, setUsuarios] = useState([]);
const [usuarioEditando, setUsuarioEditando] = useState(null);
```

### Reportes

**Ubicación:** `src/renderer/react-app/src/pages/Reportes.jsx`

**Funcionalidades:**
- Generación de reportes PDF
- Filtros de fecha
- Exportación de datos
- Visualización de estadísticas

**Estado:**
```javascript
const [fechaInicio, setFechaInicio] = useState('');
const [fechaFin, setFechaFin] = useState('');
const [tipoReporte, setTipoReporte] = useState('inventario');
```

---

## Utilidades y Helpers

### Cliente API

**Ubicación:** `src/renderer/react-app/src/api.js`

**Funciones:**
- `get(path)`: Realiza petición GET
- `post(path, body)`: Realiza petición POST
- `put(path, body)`: Realiza petición PUT
- `del(path)`: Realiza petición DELETE

**Ejemplo de uso:**
```javascript
import { get, post, put, del } from './api';

// Obtener productos
const productos = await get('/api/productos');

// Crear producto
const nuevoProducto = await post('/api/productos', {
  name: 'Nuevo Producto',
  price: 29.99
});

// Actualizar producto
await put('/api/productos/1', {
  name: 'Producto Actualizado'
});

// Eliminar producto
await del('/api/productos/1');
```

### Contexto de Autenticación

**Ubicación:** `src/renderer/react-app/src/context/AuthContext.jsx`

**Funcionalidades:**
- Manejo del estado de autenticación
- Persistencia del token
- Funciones de login/logout
- Protección de rutas

**Ejemplo de uso:**
```jsx
import { AuthProvider, useAuth } from './context/AuthContext';

// En el componente principal
<AuthProvider>
  <App />
</AuthProvider>

// En un componente hijo
const { user, login, logout, isAuthenticated } = useAuth();
```

### Utilidades de Seguridad

**Ubicación:** `src/renderer/security-utils.js`

**Funciones:**
- Validación de tokens
- Sanitización de datos
- Encriptación de información sensible

---

## Configuración y Despliegue

### Variables de Entorno

**Backend (.env):**
```env
PORT=3001
NODE_ENV=production
JWT_SECRET=tu_clave_secreta_aqui
CORS_ORIGIN=https://tu-dominio.com
RUN_MIGRATIONS_ON_START=true
```

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:3001
```

### Scripts de NPM

**Backend:**
```json
{
  "start-api": "node src/server.js",
  "db:migrate": "node src/database/migrate.js",
  "test": "jest"
}
```

**Frontend:**
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

### Despliegue con Electron

```bash
# Instalar dependencias
npm install

# Construir el frontend
npm run build:renderer

# Iniciar la aplicación
npm start
```

### Despliegue con Tauri

```bash
# Instalar dependencias de Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Instalar Tauri CLI
npm install -g @tauri-apps/cli

# Desarrollo
npm run tauri:dev

# Construcción
npm run tauri:build
```

### Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel --prod
```

---

## Ejemplos de Uso

### Ejemplo 1: Crear un Producto

```javascript
// Frontend
const crearProducto = async () => {
  try {
    const producto = {
      name: 'Proteína Whey',
      sku: 'PROT001',
      category: 'Proteínas',
      brand: 'Marca X',
      price: 89.99,
      sale_price: 99.99,
      expiry_date: '2024-12-31'
    };
    
    const response = await post('/api/productos', producto);
    
    if (response.success) {
      console.log('Producto creado con ID:', response.id);
      // Actualizar la lista de productos
      cargarProductos();
    }
  } catch (error) {
    console.error('Error al crear producto:', error);
  }
};
```

### Ejemplo 2: Registrar una Venta

```javascript
// Frontend
const registrarVenta = async (productoId, cantidad, precio) => {
  try {
    const venta = {
      product_id: productoId,
      quantity: cantidad,
      sale_price: precio,
      discount: 0,
      channel: 'Tienda física',
      created_by: usuario.id
    };
    
    const response = await post('/api/ventas', venta);
    
    if (response.success) {
      console.log('Venta registrada con ID:', response.id);
      // Actualizar estadísticas
      actualizarDashboard();
    }
  } catch (error) {
    console.error('Error al registrar venta:', error);
  }
};
```

### Ejemplo 3: Generar Reporte PDF

```javascript
// Frontend
const generarReporteInventario = async () => {
  try {
    const response = await fetch('/api/reportes/inventario/pdf', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_inventario.pdf';
      a.click();
    }
  } catch (error) {
    console.error('Error al generar reporte:', error);
  }
};
```

### Ejemplo 4: Movimiento de Stock

```javascript
// Backend
const registrarMovimientoStock = async (req, res) => {
  try {
    const { producto_id, tipo_movimiento, cantidad, motivo, user_id } = req.body;
    
    // Validaciones
    if (!producto_id || !tipo_movimiento || !cantidad) {
      return res.status(400).json({
        success: false,
        message: 'Campos obligatorios faltantes'
      });
    }
    
    // Crear movimiento
    const movimiento = await createStockMovement({
      body: {
        producto_id,
        tipo_movimiento,
        cantidad,
        motivo,
        user_id
      }
    }, res);
    
    res.json({
      success: true,
      message: 'Movimiento registrado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar movimiento'
    });
  }
};
```

---

## Casos de Prueba

### Pruebas de API

#### Prueba 1: Autenticación
```javascript
describe('Autenticación', () => {
  test('Login exitoso con credenciales válidas', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'admin',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
  
  test('Login fallido con credenciales inválidas', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({
        username: 'admin',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
```

#### Prueba 2: Gestión de Productos
```javascript
describe('Productos', () => {
  test('Crear producto exitosamente', async () => {
    const producto = {
      name: 'Test Product',
      sku: 'TEST001',
      category: 'Test',
      price: 29.99
    };
    
    const response = await request(app)
      .post('/api/productos')
      .send(producto);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.id).toBeDefined();
  });
  
  test('Obtener lista de productos', async () => {
    const response = await request(app)
      .get('/api/productos');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.productos)).toBe(true);
  });
});
```

#### Prueba 3: Gestión de Ventas
```javascript
describe('Ventas', () => {
  test('Registrar venta exitosamente', async () => {
    const venta = {
      product_id: 1,
      quantity: 2,
      sale_price: 99.99,
      created_by: 1
    };
    
    const response = await request(app)
      .post('/api/ventas')
      .send(venta);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Pruebas de Componentes React

#### Prueba 1: Componente Button
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('Renderiza correctamente', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  test('Ejecuta onClick cuando se hace clic', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('Aplica variantes correctamente', () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-red-600');
  });
});
```

#### Prueba 2: Componente InventoryTable
```javascript
import { render, screen } from '@testing-library/react';
import { InventoryTable } from './InventoryTable';

describe('InventoryTable Component', () => {
  const mockData = [
    {
      id: 1,
      name: 'Test Product',
      sku: 'TEST001',
      category: 'Test',
      stock: 10,
      price: 29.99
    }
  ];
  
  test('Renderiza datos correctamente', () => {
    render(
      <InventoryTable 
        data={mockData}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('TEST001')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

### Pruebas de Integración

#### Prueba 1: Flujo Completo de Venta
```javascript
describe('Flujo de Venta', () => {
  test('Registrar venta y actualizar stock', async () => {
    // 1. Crear producto
    const producto = await crearProducto({
      name: 'Test Product',
      price: 29.99
    });
    
    // 2. Registrar venta
    const venta = await registrarVenta({
      product_id: producto.id,
      quantity: 2,
      sale_price: 29.99
    });
    
    // 3. Verificar que la venta se registró
    expect(venta.success).toBe(true);
    
    // 4. Verificar que el stock se actualizó
    const inventario = await obtenerInventario();
    const productoActualizado = inventario.find(p => p.id === producto.id);
    expect(productoActualizado.stock_real).toBeLessThan(10); // Asumiendo stock inicial de 10
  });
});
```

---

## Conclusión

Esta documentación proporciona una guía completa para el desarrollo, uso y mantenimiento del sistema VitaSport. Incluye:

- **APIs REST** con ejemplos de request/response
- **Controladores** con funciones y casos de uso
- **Componentes React** con props y ejemplos
- **Páginas** con funcionalidades y estado
- **Utilidades** para desarrollo y testing
- **Configuración** para diferentes entornos
- **Ejemplos prácticos** de implementación
- **Casos de prueba** para validación

Para más información o soporte, consulta el código fuente o contacta al equipo de desarrollo.

---

**Última actualización:** Enero 2024  
**Versión:** 1.0.0  
**Autor:** KronoxYT