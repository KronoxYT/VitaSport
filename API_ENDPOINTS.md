# VitaSport - API Endpoints

Este documento define los endpoints de la API REST para la aplicación VitaSport.

---

## Autenticación

### POST /api/login
- **Descripción:** Autentica a un usuario y crea una sesión.
- **Request Body:**
  ```json
  {
    "username": "nombre_de_usuario",
    "password": "contraseña"
  }
  ```
- **Response (Success):**
  ```json
  {
    "message": "Login exitoso",
    "user": {
      "id": 1,
      "username": "nombre_de_usuario",
      "role": "Administrador"
    }
  }
  ```

### POST /api/logout
- **Descripción:** Cierra la sesión del usuario.

---

## Usuarios (Solo Administradores)

### GET /api/users
- **Descripción:** Obtiene una lista de todos los usuarios.

### POST /api/users
- **Descripción:** Crea un nuevo usuario.
- **Request Body:**
  ```json
  {
    "username": "nuevo_usuario",
    "password": "contraseña",
    "role": "Vendedor",
    "fullname": "Nombre Completo"
  }
  ```

### PUT /api/users/:id
- **Descripción:** Actualiza un usuario existente.

### DELETE /api/users/:id
- **Descripción:** Elimina un usuario existente.

---

## Productos

### GET /api/products
- **Descripción:** Obtiene una lista de todos los productos con su stock actual.
- **Query Params (Opcional):** `?search=texto&category=proteinas`

### GET /api/products/:id
- **Descripción:** Obtiene los detalles de un producto específico.

### POST /api/products
- **Descripción:** Crea un nuevo producto (Admin).
- **Request Body:** (Campos de la tabla `products`)

### PUT /api/products/:id
- **Descripción:** Actualiza un producto existente (Admin).

### DELETE /api/products/:id
- **Descripción:** Elimina un producto (Admin).

---

## Movimientos de Stock

### GET /api/stock-movements
- **Descripción:** Obtiene el historial de movimientos de inventario.
- **Query Params (Opcional):** `?productId=1&type=ingreso`

### POST /api/stock-movements
- **Descripción:** Registra una nueva entrada o salida de stock.
- **Request Body:**
  ```json
  {
    "product_id": 1,
    "type": "ingreso" | "egreso" | "ajuste",
    "quantity": 10,
    "note": "Compra a proveedor X"
  }
  ```

---

## Compras

### POST /api/purchases
- **Descripción:** Registra una nueva compra de productos.
- **Request Body:** (Campos de la tabla `purchases`)

---

## Ventas

### POST /api/sales
- **Descripción:** Registra una nueva venta.
- **Request Body:**
  ```json
  {
    "product_id": 1,
    "quantity": 2,
    "sale_price": 50.00,
    "discount": 0
  }
  ```

---

## Reportes

### GET /api/reports/monthly
- **Descripción:** Genera un reporte mensual de ventas y stock.
- **Response:** Devuelve un archivo PDF.

### GET /api/reports/statistics
- **Descripción:** Obtiene datos para las gráficas (productos más vendidos, etc.).
- **Response:**
  ```json
  {
    "topSellingProducts": [...],
    "lowStockProducts": [...]
  }
  ```
