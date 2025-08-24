# GEMINI.md - VitaSport Project (Versión Mejorada)

## Resumen del Proyecto

Este proyecto es un sistema de escritorio para la gestión de inventario llamado **VitaSport**, construido con Electron. Está diseñado para administrar productos, stock, ventas y usuarios de manera eficiente y robusta.

La aplicación se compone de:

*   **Frontend:** Una interfaz de usuario basada en Electron con HTML, CSS y JavaScript. Las vistas se encuentran en `src/renderer/views`.
*   **Backend:** Un servidor Node.js que utiliza el framework Express.js para proporcionar una API RESTful al frontend. La lógica del servidor está organizada en controladores y rutas.
*   **Base de Datos:** Se utiliza una base de datos SQLite (`vitasport.sqlite`) para el almacenamiento de datos. El esquema es gestionado por un script de migración de Knex.js en `src/database/migrate.js`.
*   **Autenticación:** La aplicación utiliza JSON Web Tokens (JWT) para la autenticación de usuarios, con el token guardado en los datos de sesión de la aplicación.

## Mejoras Realizadas

Esta versión del proyecto ha sido sometida a una profunda refactorización y mejora para asegurar su funcionalidad, estabilidad y mantenibilidad:

1.  **Red de Seguridad de Pruebas:** Se ha implementado una suite de pruebas para el backend utilizando **Jest** y **Supertest**. Esto garantiza que la lógica de la API principal sea estable y previene regresiones.
2.  **Refactorización del Backend:** Se ha reestructurado completamente el backend, moviendo la lógica de negocio desde un único archivo `server.js` a controladores dedicados (`productController`, `salesController`, `reportsController`, etc.), siguiendo las mejores prácticas de diseño de software.
3.  **Frontend Funcional y Robusto:**
    *   Se han implementado todas las funcionalidades pendientes (`TODOs`), incluyendo la gestión de movimientos de stock y la exportación de reportes.
    *   Se ha reemplazado el sistema de `alert()` por notificaciones no invasivas.
    *   Se ha mejorado el cargador de vistas para prevenir fugas de memoria.
    *   Se ha eliminado el código "hardcodeado" (como los ID de usuario) para obtener datos dinámicamente.
4.  **Consistencia de la Base de Datos:** Se ha corregido y unificado el esquema de la base de datos en los scripts de migración y en el entorno de pruebas.

## Estructura del Proyecto

La lógica de la aplicación se encuentra principalmente en el directorio `src`:

*   `src/main`: Contiene el proceso principal de Electron (`main.js`) y el script de `preload.js`.
*   `src/renderer`: Contiene la interfaz de usuario, incluyendo un `shell.html` y las vistas dinámicas en `src/renderer/views`.
*   `src/database`: Gestiona la conexión (`database.js`) y el esquema (`migrate.js`) de la base de datos.
*   `src/controllers`: Contiene la lógica de negocio para cada recurso de la API (productos, ventas, usuarios, etc.).
*   `src/routes`: Define los endpoints de la API y los conecta con sus respectivos controladores.
*   `src/__tests__`: Contiene las pruebas de la API del backend.

## Building and Running

### Prerrequisitos

*   Node.js y npm deben estar instalados.

### Instalación

1.  Clona el repositorio.
2.  Instala las dependencias:
    ```bash
    npm install
    ```

### Migración de la Base de Datos

*   Antes de iniciar la aplicación por primera vez, aplica las migraciones de la base de datos:
    ```bash
    npm run db:migrate
    ```

### Ejecutar la Aplicación

*   Para iniciar la aplicación, ejecuta:
    ```bash
    npm start
    ```

### Ejecutar las Pruebas

*   Para ejecutar la suite de pruebas del backend, usa:
    ```bash
    npm test
    ```

## API Endpoints

La API está organizada por recursos:

*   **Productos:** `GET /api/productos`, `POST /api/productos`, `GET /api/productos/:id`, `PUT /api/productos/:id`, `DELETE /api/productos/:id`
*   **Usuarios:** `GET /api/usuarios`, `POST /api/usuarios`, `GET /api/usuarios/:id`, `PUT /api/usuarios/:id`, `DELETE /api/usuarios/:id`
*   **Ventas:** `GET /api/ventas`, `POST /api/ventas`, `DELETE /api/ventas/:id`
*   **Stock:** `GET /api/stock/:productId`, `POST /api/stock`
*   **Inventario:** `GET /api/inventario` (Devuelve productos con stock calculado)
*   **Alertas:** `GET /api/alertas/stock-bajo`, `GET /api/alertas/vencimiento`
*   **Estadísticas:** `GET /api/estadisticas/ventas-producto`, `GET /api/estadisticas/ventas-mes`
*   **Reportes (PDF):** `GET /api/reportes/inventario/pdf`, `GET /api/reportes/ventas/pdf`, `GET /api/reportes/general/pdf`