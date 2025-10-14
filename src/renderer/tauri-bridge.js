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
      // --- Auth & token stored locally in appDir/session.json ---
      login: async (username, password) => {
        // Call backend login endpoint
        const res = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        return res.json();
      },
      verifyToken: async (token) => {
        const res = await fetch(`${API_BASE_URL}/verify-token`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token })
        });
        return res.json();
      },
      saveToken: async (token) => {
        try {
          const p = await getSessionPath();
          await fs.writeTextFile({ path: p, contents: JSON.stringify({ token }) });
          return true;
        } catch (e) { console.error('saveToken error', e); return false; }
      },
      getToken: async () => {
        try {
          const p = await getSessionPath();
          const content = await fs.readTextFile(p);
          return JSON.parse(content).token;
        } catch (e) { return null; }
      },
      clearToken: async () => {
        try { const p = await getSessionPath(); await fs.removeFile(p); return true; } catch (e) { return false; }
      },
      getCurrentUser: async () => {
        try {
          const token = await api.getToken();
          if (!token) return null;
          const res = await fetch(`${API_BASE_URL}/current-user`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) return null;
          return res.json();
        } catch (e) { return null; }
      },

      // --- Productos ---
      getProductos: async () => {
        const res = await fetch(`${API_BASE_URL}/productos`);
        return res.json();
      },
      getProductoById: async (id) => {
        const res = await fetch(`${API_BASE_URL}/productos/${id}`);
        return res.json();
      },
      createProducto: async (data) => {
        const res = await fetch(`${API_BASE_URL}/productos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        return res.json();
      },
      updateProducto: async (id, data) => {
        const res = await fetch(`${API_BASE_URL}/productos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        return res.json();
      },
      deleteProducto: async (id) => {
        const res = await fetch(`${API_BASE_URL}/productos/${id}`, { method: 'DELETE' });
        return res.json();
      },

      // --- Usuarios ---
      getUsuarios: async () => { const res = await fetch(`${API_BASE_URL}/usuarios`); return res.json(); },
      getUsuarioById: async (id) => { const res = await fetch(`${API_BASE_URL}/usuarios/${id}`); return res.json(); },
      createUsuario: async (data) => { const res = await fetch(`${API_BASE_URL}/usuarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json(); },
      updateUsuario: async (id, data) => { const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json(); },
      deleteUsuario: async (id) => { const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, { method: 'DELETE' }); return res.json(); },

      // --- Stock ---
      getStockMovements: async (productId) => { const res = await fetch(`${API_BASE_URL}/stock/${productId}`); return res.json(); },
      createStockMovement: async (data) => { const res = await fetch(`${API_BASE_URL}/stock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json(); },

      // --- Ventas ---
      getVentas: async () => { const res = await fetch(`${API_BASE_URL}/ventas`); return res.json(); },
      createVenta: async (data) => { const res = await fetch(`${API_BASE_URL}/ventas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); return res.json(); },
      deleteVenta: async (id) => { const res = await fetch(`${API_BASE_URL}/ventas/${id}`, { method: 'DELETE' }); return res.json(); },

      // --- Dashboard / Stats ---
      getDashboardKPIs: async () => { const inventory = await (await fetch(`${API_BASE_URL}/inventario`)).json(); const sales = await (await fetch(`${API_BASE_URL}/ventas`)).json(); const alerts = await (await fetch(`${API_BASE_URL}/alertas/stock-bajo`)).json(); return { totalProducts: inventory.inventario?.length || 0, totalSales: sales.ventas?.reduce((sum, sale) => sum + sale.quantity, 0) || 0, lowStockAlerts: alerts.alertas?.length || 0 }; },
      getSalesByMonth: async () => { const res = await fetch(`${API_BASE_URL}/estadisticas/ventas-mes`); return res.json(); },
      getSalesByProduct: async () => { const res = await fetch(`${API_BASE_URL}/estadisticas/ventas-producto`); return res.json(); },

      // --- Reportes (descarga) ---
      _downloadFile: async (endpoint, suggestedName) => {
        const res = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!res.ok) throw new Error('Error descargando archivo');
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const downloads = await path.downloadDir();
        const fileName = suggestedName || 'reporte.pdf';
        const filePath = `${downloads}/${fileName}`;
        await fs.writeFile({ path: filePath, contents: buffer });
        await openExternal(filePath);
        return { success: true, path: filePath };
      },
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
