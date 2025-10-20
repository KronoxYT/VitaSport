# 🏋️ VitaSport - Sistema de Gestión de Inventario

> Sistema moderno y profesional de gestión de inventario para tiendas de suplementos deportivos

[![Tauri](https://img.shields.io/badge/Tauri-2.8.5-blue)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178c6)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8)](https://tailwindcss.com/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Arquitectura](#-arquitectura)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

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

## Comandos Disponibles

### Modo Desarrollo (Recomendado para UI)

```bash
npm run dev
```

**Características:**
- ⚡ **Extremadamente rápido** - Hot reload instantáneo
- 🎨 **Perfecto para diseño UI** - Cambios visuales inmediatos
- 🚫 **Sin base de datos** - Solo interfaz, sin backend
- ✅ **Sin errores de consola** - Detección automática de modo

**Cuándo usar:** Diseño de interfaz, ajustes de estilo, maquetación

### Modo Producción (Backend Completo)

```bash
npm run tauri:dev
```

**Características:**
- 🗄️ **Base de datos SQLite funcional** - Datos persistentes
- 🔧 **Todos los comandos Tauri** - Funcionalidad completa
- ⏱️ **Primera compilación: 3-5 min** - Subsecuentes más rápidas
- 💾 **Comportamiento real** - Idéntico a producción

**Cuándo usar:** Testing de funcionalidades, desarrollo de backend, pruebas finales

### Compilar para Distribución

```bash
npm run tauri:build
```

Genera ejecutables para tu sistema operativo en `src-tauri/target/release/bundle/`

---

## Entendiendo los Modos de Ejecución

### ¿Por qué dos modos?

**Problema:** Compilar Rust/Tauri toma 3-5 minutos cada vez, haciendo el desarrollo lento.

**Solución:** Detectar automáticamente si Tauri está disponible.

### ¿Cómo funciona?

```typescript
// El código detecta automáticamente el modo
if (typeof window !== 'undefined' && '__TAURI__' in window) {
    // MODO TAURI: Usar base de datos real
    const products = await invoke('get_products');
} else {
    // MODO DESARROLLO: UI sin backend
    console.info('🚀 Modo desarrollo activo');
}
```

### Mensajes en Consola

```
🚀 Modo desarrollo: Ejecutando sin backend Tauri
💡 Para ver datos reales, ejecuta: npm run tauri:dev
✅ Operación exitosa
❌ Error
⚠️ Advertencia
```

**Nota:** Los mensajes `🚀` y `💡` son normales en modo desarrollo y no son errores.

## Estructura del Proyecto

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

La aplicación utiliza SQLite para almacenamiento local. La base de datos se crea automáticamente en el primer inicio sin datos precargados.

### Tablas:
- `users` - Usuarios del sistema (administradores, vendedores)
- `products` - Catálogo completo de productos con SKU, precios, stock, etc.
- `stock_movements` - Registro de entradas y salidas de inventario
- `sales` - Transacciones de venta con detalles de productos y descuentos
- `purchases` - Registro de compras a proveedores

**Nota:** La base de datos se crea vacía. Debes agregar tus propios productos y datos.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.

## 📄 Licencia

Este proyecto es de código abierto.

## 👤 Autor

**KronoxYT**

---

Hecho con ❤️ usando Tauri + React
