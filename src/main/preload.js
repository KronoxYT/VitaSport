const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // --- Autenticación ---
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  verifyToken: (token) => ipcRenderer.invoke('verify-token', token),
  saveToken: (token) => ipcRenderer.send('save-token', token),
  getToken: () => ipcRenderer.invoke('get-token'),
  clearToken: () => ipcRenderer.send('clear-token'),
  getCurrentUser: () => ipcRenderer.invoke('get-current-user'),

  // --- Productos ---
  getProductos: () => ipcRenderer.invoke('get-productos'),
  getProductoById: (id) => ipcRenderer.invoke('get-producto-by-id', id),
  createProducto: (data) => ipcRenderer.invoke('create-producto', data),
  updateProducto: (id, data) => ipcRenderer.invoke('update-producto', id, data),
  deleteProducto: (id) => ipcRenderer.invoke('delete-producto', id),
  selectImage: () => ipcRenderer.invoke('select-image'),

  // --- Usuarios ---
  getUsuarios: () => ipcRenderer.invoke('get-usuarios'),
  getUsuarioById: (id) => ipcRenderer.invoke('get-usuario-by-id', id),
  createUsuario: (data) => ipcRenderer.invoke('create-usuario', data),
  updateUsuario: (id, data) => ipcRenderer.invoke('update-usuario', id, data),
  deleteUsuario: (id) => ipcRenderer.invoke('delete-usuario', id),

  // --- Movimientos de Stock ---
  getStockMovements: (productId) => ipcRenderer.invoke('get-stock-movements', productId),
  createStockMovement: (data) => ipcRenderer.invoke('create-stock-movement', data),

  // --- Ventas ---
  getVentas: () => ipcRenderer.invoke('get-ventas'),
  createVenta: (data) => ipcRenderer.invoke('create-venta', data),
  deleteVenta: (id) => ipcRenderer.invoke('delete-venta', id),

  // --- Dashboard ---
  getDashboardKPIs: () => ipcRenderer.invoke('get-dashboard-kpis'),
  getSalesByMonth: () => ipcRenderer.invoke('get-sales-by-month'),
  getSalesByProduct: () => ipcRenderer.invoke('get-sales-by-product'),

  // --- Reportes ---
  exportInventoryPDF: () => ipcRenderer.invoke('export-inventory-pdf'),
  exportSalesPDF: () => ipcRenderer.invoke('export-sales-pdf'),
  exportGeneralPDF: () => ipcRenderer.invoke('export-general-pdf'),
  exportSalesCSV: () => ipcRenderer.invoke('export-sales-csv'),

  // --- General ---
  openExternal: (url) => ipcRenderer.send('open-external', url),
});

console.log('Preload script cargado.');