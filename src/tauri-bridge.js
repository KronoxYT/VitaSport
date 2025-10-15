import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/shell';
import { appDataDir } from '@tauri-apps/api/path';

// Reemplaza todas las llamadas a window.api o ipcRenderer
export const api = {
  // --- Autenticación ---
  login: async (username, password) => {
    return await invoke('login', { username, password });
  },
  
  verifyToken: async (token) => {
    return await invoke('verify_token', { token });
  },
  
  saveToken: async (token) => {
    return await invoke('save_token', { token });
  },
  
  getToken: async () => {
    return await invoke('get_token');
  },
  
  clearToken: async () => {
    return await invoke('clear_token');
  },
  
  getCurrentUser: async () => {
    return await invoke('get_current_user');
  },

  // --- Productos ---
  getProductos: async () => {
    return await invoke('get_productos');
  },
  
  getProductoById: async (id) => {
    return await invoke('get_producto_by_id', { id });
  },
  
  createProducto: async (data) => {
    return await invoke('create_producto', { data });
  },
  
  updateProducto: async (id, data) => {
    return await invoke('update_producto', { id, data });
  },
  
  deleteProducto: async (id) => {
    return await invoke('delete_producto', { id });
  },
  
  selectImage: async () => {
    return await invoke('select_image');
  },

  // --- Usuarios ---
  getUsuarios: async () => {
    return await invoke('get_usuarios');
  },
  
  getUsuarioById: async (id) => {
    return await invoke('get_usuario_by_id', { id });
  },
  
  createUsuario: async (data) => {
    return await invoke('create_usuario', { data });
  },
  
  updateUsuario: async (id, data) => {
    return await invoke('update_usuario', { id, data });
  },
  
  deleteUsuario: async (id) => {
    return await invoke('delete_usuario', { id });
  },

  // --- Movimientos de Stock ---
  getStockMovements: async (productId) => {
    return await invoke('get_stock_movements', { productId });
  },
  
  createStockMovement: async (data) => {
    return await invoke('create_stock_movement', { data });
  },

  // --- Ventas ---
  getVentas: async () => {
    return await invoke('get_ventas');
  },
  
  createVenta: async (data) => {
    return await invoke('create_venta', { data });
  },
  
  deleteVenta: async (id) => {
    return await invoke('delete_venta', { id });
  },

  // --- Dashboard ---
  getDashboardKPIs: async () => {
    return await invoke('get_dashboard_kpis');
  },
  
  getSalesByMonth: async () => {
    return await invoke('get_sales_by_month');
  },
  
  getSalesByProduct: async () => {
    return await invoke('get_sales_by_product');
  },

  // --- Reportes ---
  exportInventoryPDF: async () => {
    return await invoke('export_inventory_pdf');
  },
  
  exportSalesPDF: async () => {
    return await invoke('export_sales_pdf');
  },
  
  exportGeneralPDF: async () => {
    return await invoke('export_general_pdf');
  },
  
  exportSalesCSV: async () => {
    return await invoke('export_sales_csv');
  },

  // --- General ---
  openExternal: async (url) => {
    await open(url);
  },
  
  getAppDataPath: async () => {
    return await appDataDir();
  }
};
