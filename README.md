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

### 🔐 Autenticación y Seguridad
- ✅ Sistema de login con credenciales por defecto (admin/admin)
- ✅ Sesión persistente en localStorage
- ✅ Rutas protegidas con redirección automática
- ✅ Usuario visible en sidebar con opción de logout

### 🎨 Interfaz y Experiencia
- ✅ **Modo oscuro automático** - Detecta y se adapta al tema del sistema operativo
- ✅ Interfaz moderna y responsive con TailwindCSS
- ✅ Transiciones y animaciones suaves
- ✅ Diseño consistente en todas las páginas

### 📊 Gestión de Datos
- ✅ Dashboard con estadísticas en tiempo real desde SQLite
- ✅ Gestión completa de productos (CRUD) con formulario detallado
- ✅ Control de inventario con alertas de stock bajo
- ✅ Registro de ventas conectado a base de datos
- ✅ Estados vacíos informativos cuando no hay datos
- ✅ Base de datos SQLite local y persistente

### 💻 Desarrollo
- ✅ Detección automática de entorno (dev vs producción)
- ✅ Hot reload ultra rápido en modo desarrollo
- ✅ Mensajes informativos en consola con emojis
- ✅ Documentación completa del código con JSDoc
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

3. Iniciar en modo desarrollo (rápido, sin backend):
```bash
npm run dev
```

4. Abrir en el navegador: `http://localhost:5173`

5. **Credenciales de acceso:**
   - Usuario: `admin`
   - Contraseña: `admin`

---

## 🔑 Primer Uso

1. Al iniciar verás la **pantalla de login**
2. Ingresa las credenciales por defecto: **admin/admin**
3. Serás redirigido al **Dashboard**
4. La sesión se mantiene automáticamente (localStorage)
5. Para cerrar sesión, haz clic en el botón al final del sidebar

### Registrar ventas y movimientos de caja

- Para registrar una **venta**:
  1. Ve a la página **Ventas** desde el sidebar.
  2. Haz clic en el botón **"Nueva Venta"**.
  3. Selecciona el producto, cantidad, precio, descuento opcional y canal.
  4. Verifica el **Total** y pulsa **"Registrar Venta"**.

- Para registrar **gastos u otros movimientos de dinero** (caja):
  1. Ve a la página **Ventas**.
  2. Haz clic en el botón **"Movimiento de Caja"** en la esquina superior derecha.
  3. Elige el **Tipo**: `Ingreso` o `Gasto / Egreso`.
  4. Ingresa el **Monto**, una **Categoría** (ej. Alquiler, Servicios, Sueldos) y una **Descripción** opcional.
  5. Pulsa **"Registrar Movimiento"**. El movimiento se sumará al resumen de caja.

**Nota:** En modo desarrollo (`npm run dev`), las páginas mostrarán interfaz vacía porque no hay backend. Para funcionalidad completa, usa `npm run tauri:dev`.

---

## 🌙 Modo Oscuro Automático

La aplicación detecta **automáticamente** el tema de tu sistema operativo:

- **Windows:** Settings > Personalization > Colors > "Choose your mode"
- **macOS:** System Preferences > General > Appearance
- **Linux:** Según tu entorno de escritorio

El tema cambia **instantáneamente** sin recargar la aplicación.

---

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

## 🎯 Páginas y Funcionalidades

### 🔐 Login
- Pantalla de inicio de sesión moderna con gradientes
- Credenciales por defecto: admin/admin
- Validación de usuarios
- Sesión persistente automática
- Animaciones y feedback visual

### 📊 Dashboard
- Estadísticas en tiempo real desde SQLite
- Total de productos, productos activos, stock bajo
- Ventas totales y revenue
- Gráficos placeholder (próximamente con datos reales)
- Alertas inteligentes: stock bajo, productos sin stock
- Modo oscuro completo

### 📦 Inventario (Productos)
- Formulario completo con todos los campos
- Búsqueda en tiempo real por nombre o SKU
- Filtros por categoría
- Tabla responsive con todos los detalles
- Estados de carga, vacío y error
- Agregar, editar y eliminar productos

### 💰 Ventas
- Conectado a base de datos real
- Estadísticas: ventas de hoy, ventas del mes y total de transacciones
- Historial completo de ventas con tabla detallada
- Estados de carga y vacío cuando no hay ventas
- Integrado con el módulo de caja para calcular ingresos totales

### 💵 Caja (Ingresos, Egresos y Gastos)
- Resumen de caja en tiempo real: **Ingresos Totales**, **Gastos / Egresos** y **Balance de Caja**.
- Registro de movimientos de caja (ingresos adicionales, gastos fijos y otros egresos).
- Modal **"Movimiento de Caja"** para agregar manualmente ingresos o egresos.
- Tabla de movimientos con fecha, tipo, monto, categoría y descripción.
- Las ventas registradas en la página **Ventas** se suman automáticamente como ingresos en la caja.

### 📈 Reportes
- Generación de reportes
- Exportación de datos
- Próximamente: gráficos avanzados

### 👥 Usuarios
- Gestión de usuarios del sistema
- Roles y permisos
- Próximamente: cambio de contraseñas

## 🔒 Base de Datos

La aplicación utiliza SQLite para almacenamiento local. La base de datos se crea automáticamente en el primer inicio sin datos precargados.

### Tablas:
- `users` - Usuarios del sistema (administradores, vendedores)
- `products` - Catálogo completo de productos con SKU, precios, stock, etc.
- `stock_movements` - Registro de entradas y salidas de inventario
- `sales` - Transacciones de venta con detalles de productos y descuentos
- `purchases` - Registro de compras a proveedores

**Nota:** La base de datos se crea vacía. Debes agregar tus propios productos y datos.

## 📚 Documentación Adicional

Este proyecto incluye documentación completa para desarrolladores:

- **[COMPILE_TIPS.md](COMPILE_TIPS.md)** - ⚡ Optimizaciones de compilación
  - Cómo reducir tiempos de compilación 40-50%
  - Configuraciones de desarrollo optimizadas
  - Flujos de trabajo eficientes
  - Tips para compilaciones rápidas

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura detallada del proyecto
  - Estructura completa del código
  - Diagramas de flujo de datos
  - Esquemas de base de datos
  - API de comandos Tauri
  - Sistema de diseño y estilos

- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guía de contribución
  - Inicio rápido para desarrolladores
  - Estándares de código y buenas prácticas
  - Cómo agregar nuevas funcionalidades (con ejemplos)
  - Convenciones de commit
  - Tips de debugging
  - FAQ para desarrolladores

Todos los archivos de código incluyen:
- ✅ Comentarios JSDoc en funciones importantes
- ✅ Explicaciones de modos de operación (dev vs producción)
- ✅ Console logs informativos con emojis

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Lee [CONTRIBUTING.md](CONTRIBUTING.md) primero
2. Abre un **issue** para discutir cambios grandes
3. Haz **fork** del repositorio
4. Crea una **rama** para tu feature
5. Sigue los **estándares de código** del proyecto
6. Envía un **pull request** con descripción clara

## 📄 Licencia

Este proyecto es de código abierto bajo licencia MIT.

## 👤 Autor

**KronoxYT**
- GitHub: [@KronoxYT](https://github.com/KronoxYT)

## 🙏 Agradecimientos

- [Tauri](https://tauri.app/) - Framework para aplicaciones de escritorio
- [React](https://reactjs.org/) - Librería UI
- [TailwindCSS](https://tailwindcss.com/) - Framework CSS
- [Lucide](https://lucide.dev/) - Iconos modernos

---

## 📝 Notas de Versión

### v1.0.0 (Actual)
- ✅ Sistema de autenticación con login
- ✅ Modo oscuro automático
- ✅ Dashboard con estadísticas reales
- ✅ CRUD completo de productos
- ✅ Gestión de ventas
- ✅ Base de datos SQLite
- ✅ Documentación completa

### Próximamente
- 🔜 Gráficos avanzados con datos reales
- 🔜 Módulo de compras a proveedores
- 🔜 Sistema de roles y permisos
- 🔜 Exportación de reportes a PDF/Excel
- 🔜 Notificaciones push
- 🔜 Backup automático de base de datos

---

<div align="center">

**Hecho con ❤️ usando Tauri + React + TypeScript**

⭐ Si te gusta este proyecto, dale una estrella en GitHub!

</div>
