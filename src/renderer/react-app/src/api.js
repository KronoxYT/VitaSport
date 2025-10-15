// Importar el puente Tauri
import { api } from '../../../tauri-bridge.js';

// Función helper para manejar respuestas de Tauri
function handleTauriResponse(response) {
  if (response.success) {
    return response.data;
  } else {
    throw new Error(response.message || 'Error desconocido');
  }
}

// --- Autenticación ---
export const login = async (username, password) => {
  const response = await api.login(username, password);
  return handleTauriResponse(response);
};

export const verifyToken = async (token) => {
  const response = await api.verifyToken(token);
  return handleTauriResponse(response);
};

export const saveToken = async (token) => {
  await api.saveToken(token);
};

export const getToken = async () => {
  return await api.getToken();
};

export const clearToken = async () => {
  await api.clearToken();
};

export const getCurrentUser = async () => {
  return await api.getCurrentUser();
};

// --- Productos ---
export const getProductos = async () => {
  const response = await api.getProductos();
  return handleTauriResponse(response);
};

export const getProductoById = async (id) => {
  const response = await api.getProductoById(id);
  return handleTauriResponse(response);
};

export const createProducto = async (data) => {
  const response = await api.createProducto(data);
  return handleTauriResponse(response);
};

export const updateProducto = async (id, data) => {
  const response = await api.updateProducto(id, data);
  return handleTauriResponse(response);
};

export const deleteProducto = async (id) => {
  const response = await api.deleteProducto(id);
  return handleTauriResponse(response);
};

export const selectImage = async () => {
  return await api.selectImage();
};

// --- Usuarios ---
export const getUsuarios = async () => {
  const response = await api.getUsuarios();
  return handleTauriResponse(response);
};

export const getUsuarioById = async (id) => {
  const response = await api.getUsuarioById(id);
  return handleTauriResponse(response);
};

export const createUsuario = async (data) => {
  const response = await api.createUsuario(data);
  return handleTauriResponse(response);
};

export const updateUsuario = async (id, data) => {
  const response = await api.updateUsuario(id, data);
  return handleTauriResponse(response);
};

export const deleteUsuario = async (id) => {
  const response = await api.deleteUsuario(id);
  return handleTauriResponse(response);
};

// --- Stock ---
export const getStockMovements = async (productId) => {
  const response = await api.getStockMovements(productId);
  return handleTauriResponse(response);
};

export const createStockMovement = async (data) => {
  const response = await api.createStockMovement(data);
  return handleTauriResponse(response);
};

// --- Ventas ---
export const getVentas = async () => {
  const response = await api.getVentas();
  return handleTauriResponse(response);
};

export const createVenta = async (data) => {
  const response = await api.createVenta(data);
  return handleTauriResponse(response);
};

export const deleteVenta = async (id) => {
  const response = await api.deleteVenta(id);
  return handleTauriResponse(response);
};

// --- Dashboard ---
export const getDashboardKPIs = async () => {
  const response = await api.getDashboardKPIs();
  return handleTauriResponse(response);
};

export const getSalesByMonth = async () => {
  const response = await api.getSalesByMonth();
  return handleTauriResponse(response);
};

export const getSalesByProduct = async () => {
  const response = await api.getSalesByProduct();
  return handleTauriResponse(response);
};

// --- Reportes ---
export const exportInventoryPDF = async () => {
  const response = await api.exportInventoryPDF();
  return handleTauriResponse(response);
};

export const exportSalesPDF = async () => {
  const response = await api.exportSalesPDF();
  return handleTauriResponse(response);
};

export const exportGeneralPDF = async () => {
  const response = await api.exportGeneralPDF();
  return handleTauriResponse(response);
};

export const exportSalesCSV = async () => {
  const response = await api.exportSalesCSV();
  return handleTauriResponse(response);
};

// --- General ---
export const openExternal = async (url) => {
  await api.openExternal(url);
};

export const getAppDataPath = async () => {
  return await api.getAppDataPath();
};
