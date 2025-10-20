# VitaSport - Sistema de Inventario

Sistema de gestión de inventario profesional construido con **Tauri**, **React**, **TypeScript** y **TailwindCSS**.

## 🚀 Características

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de productos (CRUD)
- ✅ Control de inventario con alertas de stock bajo
- ✅ Registro de ventas
- ✅ Generación de reportes
- ✅ Base de datos SQLite local
- ✅ Interfaz moderna y responsive
- ✅ Aplicación de escritorio multiplataforma

## 🛠️ Tecnologías

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: Rust (Tauri)
- **Base de Datos**: SQLite (rusqlite)
- **UI Icons**: Lucide React
- **Router**: React Router DOM v7

## 📦 Instalación

### Requisitos previos

- Node.js (v18 o superior)
- Rust (última versión estable)
- npm o yarn

### Pasos de instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/KronoxYT/VitaSport.git
cd VitaSport
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en modo desarrollo:
```bash
npm run tauri:dev
```

## 🏗️ Compilar para Producción

Para compilar la aplicación para tu sistema operativo:

```bash
npm run tauri:build
```

El ejecutable se generará en `src-tauri/target/release/`.

## 📱 Estructura del Proyecto

```
VitaSport/
├── src/                    # Código fuente del frontend
│   ├── components/        # Componentes reutilizables
│   ├── pages/            # Páginas de la aplicación
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Punto de entrada
├── src-tauri/            # Código Rust del backend
│   ├── src/
│   │   └── main.rs      # Backend de Tauri
│   ├── Cargo.toml       # Dependencias de Rust
│   └── tauri.conf.json  # Configuración de Tauri
└── package.json         # Dependencias de Node.js
```

## 🎯 Características Principales

### Dashboard
- Visualización de métricas clave
- Productos con stock bajo
- Actividad reciente
- Productos más vendidos

### Productos
- Agregar, editar y eliminar productos
- Búsqueda en tiempo real
- Categorización
- Control de precios y stock

### Inventario
- Registro de entradas y salidas
- Historial de movimientos
- Alertas automáticas de stock crítico

### Ventas
- Registro de transacciones
- Seguimiento de clientes
- Estadísticas de ventas

### Reportes
- Reportes predefinidos
- Generación de reportes personalizados
- Exportación de datos

## 🔒 Base de Datos

La aplicación utiliza SQLite para almacenamiento local. La base de datos se crea automáticamente en el primer inicio con datos de ejemplo.

### Tablas:
- `products` - Información de productos
- `sales` - Registro de ventas
- `inventory_movements` - Movimientos de inventario

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📄 Licencia

Este proyecto es de código abierto.

## 👤 Autor

**KronoxYT**

---

Hecho con ❤️ usando Tauri + React
