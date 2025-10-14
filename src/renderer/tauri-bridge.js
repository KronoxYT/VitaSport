// Puente ligero para permitir que el renderer use API similares a las expuestas por Electron preload
// Si la app corre dentro de Tauri, se mapearán llamadas a @tauri-apps/api; si no, se espera que exista window.api (Electron preload)

(async () => {
  function noop() { throw new Error('API no disponible en este entorno'); }

  const tauriAvailable = typeof window.__TAURI__ !== 'undefined' || typeof window.__TAURI_IPC__ !== 'undefined';
  let api = {};

  if (tauriAvailable) {
    // Import dinamico de módulos de Tauri
    const { invoke } = await import('@tauri-apps/api/tauri');
  const { open } = await import('@tauri-apps/api/dialog');
  const fs = await import('@tauri-apps/api/fs');
  const path = await import('@tauri-apps/api/path');
  const { open: openExternal } = await import('@tauri-apps/api/shell');

    const API_BASE_URL = 'http://localhost:3001/api';

    async function getSessionPath() {
      const dir = await path.appDir();
      return `${dir}session.json`;
    }

    api = {
      // Minimal commands mapped to Rust invoke handlers
      ping: async () => invoke('ping'),
      saveToken: async (token) => invoke('save_token', { token }),
      getToken: async () => {
        const r = await invoke('get_token');
        // invoke may return null/undefined
        return r === null || typeof r === 'undefined' ? null : r;
      },
      clearToken: async () => invoke('clear_token'),

      // Higher-level auth helpers that call the backend HTTP API
      login: async (username, password) => {
        const res = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
        });
        return res.json();
      },
      verifyToken: async (token) => {
        const res = await fetch(`${API_BASE_URL}/verify-token`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token })
        });
        return res.json();
      },
      getCurrentUser: async () => {
        try {
          const token = await api.getToken();
          if (!token) return null;
          const res = await fetch(`${API_BASE_URL}/current-user`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) return null;
          return res.json();
        } catch (e) { return null; }
      },

      // --- Productos (delegado a Rust)
      getProductos: async () => JSON.parse(await invoke('api_request', { method: 'GET', endpoint: '/productos', body: null })),
      getProductoById: async (id) => JSON.parse(await invoke('api_request', { method: 'GET', endpoint: `/productos/${id}`, body: null })),
      createProducto: async (data) => JSON.parse(await invoke('api_request', { method: 'POST', endpoint: '/productos', body: JSON.stringify(data) })),
      updateProducto: async (id, data) => JSON.parse(await invoke('api_request', { method: 'PUT', endpoint: `/productos/${id}`, body: JSON.stringify(data) })),
      deleteProducto: async (id) => JSON.parse(await invoke('api_request', { method: 'DELETE', endpoint: `/productos/${id}`, body: null })),

      // --- Usuarios ---
  getUsuarios: async () => JSON.parse(await invoke('api_request', { method: 'GET', endpoint: '/usuarios', body: null })),
  getUsuarioById: async (id) => JSON.parse(await invoke('api_request', { method: 'GET', endpoint: `/usuarios/${id}`, body: null })),
  createUsuario: async (data) => JSON.parse(await invoke('api_request', { method: 'POST', endpoint: '/usuarios', body: JSON.stringify(data) })),
  updateUsuario: async (id, data) => JSON.parse(await invoke('api_request', { method: 'PUT', endpoint: `/usuarios/${id}`, body: JSON.stringify(data) })),
  deleteUsuario: async (id) => JSON.parse(await invoke('api_request', { method: 'DELETE', endpoint: `/usuarios/${id}`, body: null })),

      // --- Stock ---
  getStockMovements: async (productId) => JSON.parse(await invoke('api_request', { method: 'GET', endpoint: `/stock/${productId}`, body: null })),
  createStockMovement: async (data) => JSON.parse(await invoke('api_request', { method: 'POST', endpoint: '/stock', body: JSON.stringify(data) })),

      // --- Ventas ---
  getVentas: async () => JSON.parse(await invoke('api_request', { method: 'GET', endpoint: '/ventas', body: null })),
  createVenta: async (data) => JSON.parse(await invoke('api_request', { method: 'POST', endpoint: '/ventas', body: JSON.stringify(data) })),
  deleteVenta: async (id) => JSON.parse(await invoke('api_request', { method: 'DELETE', endpoint: `/ventas/${id}`, body: null })),

      // --- Dashboard / Stats ---
  getDashboardKPIs: async () => JSON.parse(await invoke('api_request', { method: 'GET', endpoint: '/inventario', body: null })).then(async (inventory) => { const sales = await JSON.parse(await invoke('api_request', { method: 'GET', endpoint: '/ventas', body: null })); const alerts = await JSON.parse(await invoke('api_request', { method: 'GET', endpoint: '/alertas/stock-bajo', body: null })); return { totalProducts: inventory.inventario?.length || 0, totalSales: sales.ventas?.reduce((sum, sale) => sum + sale.quantity, 0) || 0, lowStockAlerts: alerts.alertas?.length || 0 }; }),
  getSalesByMonth: async () => JSON.parse(await invoke('api_request', { method: 'GET', endpoint: '/estadisticas/ventas-mes', body: null })),
  getSalesByProduct: async () => JSON.parse(await invoke('api_request', { method: 'GET', endpoint: '/estadisticas/ventas-producto', body: null })),

      // --- Reportes (descarga) ---
      _downloadFile: async (endpoint, suggestedName) => JSON.parse(await invoke('api_file_request', { endpoint, suggested_name: suggestedName })),
      exportInventoryPDF: async () => api._downloadFile('/reportes/inventario/pdf', 'inventario.pdf'),
      exportSalesPDF: async () => api._downloadFile('/reportes/ventas/pdf', 'ventas.pdf'),
      exportGeneralPDF: async () => api._downloadFile('/reportes/general/pdf', 'general.pdf'),
      exportSalesCSV: async () => api._downloadFile('/ventas/csv', 'ventas.csv'),

      // --- General ---
      openExternal: async (url) => { await openExternal(url); },
      selectImage: async () => {
        const selected = await open({ multiple: false, filters: [{ name: 'Images', extensions: ['jpg','png','gif'] }] });
        return Array.isArray(selected) ? selected[0] : selected;
      }
    };
  } else if (window.api) {
    api = window.api; // existing Electron API
  } else {
    api = {
      login: noop,
      verifyToken: noop,
      saveToken: noop,
      getToken: noop,
      clearToken: noop,
      getCurrentUser: noop,
      getProductos: noop,
      getProductoById: noop,
      createProducto: noop,
      updateProducto: noop,
      deleteProducto: noop,
      selectImage: noop,
      openExternal: (url) => window.open(url, '_blank')
    };
  }

  // Exponer aliases para compatibilidad con el código existente
  window.tauriApi = api;
  // Exponer window.api para que el código actual no necesite cambios
  try { window.api = api; } catch (e) { /* ignore */ }
})();
