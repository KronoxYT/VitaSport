const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { startServer } = require('../server.js');
const userController = require('../controllers/userController');

let mainWindow;

// --- Bloqueo de Instancia Única ---
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Si alguien intenta ejecutar una segunda instancia, debemos enfocar nuestra ventana.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // --- El resto de la inicialización de la app va aquí ---
  const TOKEN_PATH = path.join(app.getPath('userData'), 'session.json');

  // --- Token Management ---
  function saveToken(token) {
      try {
          fs.writeFileSync(TOKEN_PATH, JSON.stringify({ token }));
      } catch (error) {
          console.error('Error saving token:', error);
      }
  }

  function getToken() {
      try {
          if (fs.existsSync(TOKEN_PATH)) {
              const data = fs.readFileSync(TOKEN_PATH, 'utf-8');
              return JSON.parse(data).token;
          }
      } catch (error) {
          console.error('Error reading token:', error);
      }
      return null;
  }

  function clearToken() {
      try {
          if (fs.existsSync(TOKEN_PATH)) {
              fs.unlinkSync(TOKEN_PATH);
          }
      } catch (error) {
          console.error('Error clearing token:', error);
      }
  }

  const createWindow = async () => {
      const token = getToken();
      let isValidToken = false;
      if (token) {
          const verificationResult = userController.verifyToken(token);
          isValidToken = verificationResult.success;
      }

      mainWindow = new BrowserWindow({
          width: 1200,
          height: 800,
          webPreferences: {
              preload: path.join(__dirname, 'preload.js'),
              nodeIntegration: false,
              contextIsolation: true,
          }
      });

      if (isValidToken) {
          mainWindow.loadFile(path.join(__dirname, '../renderer/shell.html'));
      } else {
          mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
      }
      // mainWindow.webContents.openDevTools();
  };

  // --- IPC Handlers ---
  function setupIpcHandlers() {
      const API_BASE_URL = 'http://localhost:3001/api';

      // --- Auth ---
      ipcMain.handle('login', async (_, username, password) => {
          return await userController.loginUser(username, password);
      });
      ipcMain.handle('verify-token', (_, token) => {
          return userController.verifyToken(token);
      });
      ipcMain.on('save-token', (_, token) => saveToken(token));
      ipcMain.handle('get-token', () => getToken());
      ipcMain.on('clear-token', () => clearToken());
      ipcMain.handle('get-current-user', () => {
          const token = getToken();
          if (!token) return null;
          const verification = userController.verifyToken(token);
          return verification.success ? verification.data : null;
      });

      // --- Peticiones a la API ---
      async function apiRequest(method, endpoint, body = null) {
          try {
              const options = { method: method.toUpperCase(), headers: { 'Content-Type': 'application/json' } };
              if (body) options.body = JSON.stringify(body);
              const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
              if (!response.ok) {
                  const errorData = await response.json().catch(() => ({ message: response.statusText }));
                  throw new Error(errorData.message || 'Error en la petición al servidor');
              }
              return response.json();
          } catch (error) {
              console.error(`Error en apiRequest (${method} ${endpoint}):`, error);
              throw error;
          }
      }

      async function apiFileRequest(endpoint) {
          try {
              const response = await fetch(`${API_BASE_URL}${endpoint}`);
              if (!response.ok) {
                  const errorData = await response.json().catch(() => ({ message: response.statusText }));
                  throw new Error(errorData.message || 'Error en la petición al servidor');
              }
              const blob = await response.blob();
              const buffer = Buffer.from(await blob.arrayBuffer());
              const downloadsPath = app.getPath('downloads');
              const fileName = response.headers.get('content-disposition')?.split('filename=')[1] || 'reporte.pdf';
              const filePath = path.join(downloadsPath, fileName.replace(/"/g, ''));
              fs.writeFileSync(filePath, buffer);
              shell.openPath(filePath);
              return { success: true };
          } catch (error) {
              console.error(`Error en apiFileRequest (${endpoint}):`, error);
              throw error;
          }
      }

      // Productos
      ipcMain.handle('get-productos', () => apiRequest('get', '/productos'));
      ipcMain.handle('get-producto-by-id', (_, id) => apiRequest('get', `/productos/${id}`));
      ipcMain.handle('create-producto', (_, data) => apiRequest('post', '/productos', data));
      ipcMain.handle('update-producto', (_, id, data) => apiRequest('put', `/productos/${id}`, data));
      ipcMain.handle('delete-producto', (_, id) => apiRequest('delete', `/productos/${id}`));

      // Usuarios
      ipcMain.handle('get-usuarios', () => apiRequest('get', '/usuarios'));
      ipcMain.handle('get-usuario-by-id', (_, id) => apiRequest('get', `/usuarios/${id}`));
      ipcMain.handle('create-usuario', (_, data) => apiRequest('post', '/usuarios', data));
      ipcMain.handle('update-usuario', (_, id, data) => apiRequest('put', `/usuarios/${id}`, data));
      ipcMain.handle('delete-usuario', (_, id) => apiRequest('delete', `/usuarios/${id}`));

      // Stock
      ipcMain.handle('get-stock-movements', (_, productId) => apiRequest('get', `/stock/${productId}`));
      ipcMain.handle('create-stock-movement', (_, data) => apiRequest('post', '/stock', data));

      // Ventas
      ipcMain.handle('get-ventas', () => apiRequest('get', '/ventas'));
      ipcMain.handle('create-venta', (_, data) => apiRequest('post', '/ventas', data));
      ipcMain.handle('delete-venta', (_, id) => apiRequest('delete', `/ventas/${id}`));

      // Dashboard y Estadísticas
      ipcMain.handle('get-dashboard-kpis', async () => {
          const inventory = await apiRequest('get', '/inventario');
          const sales = await apiRequest('get', '/ventas');
          const alerts = await apiRequest('get', '/alertas/stock-bajo');
          return {
              totalProducts: inventory.inventario?.length || 0,
              totalSales: sales.ventas?.reduce((sum, sale) => sum + sale.quantity, 0) || 0,
              lowStockAlerts: alerts.alertas?.length || 0
          };
      });
      ipcMain.handle('get-sales-by-month', () => apiRequest('get', '/estadisticas/ventas-mes'));
      ipcMain.handle('get-sales-by-product', () => apiRequest('get', '/estadisticas/ventas-producto'));

      // Reportes
      ipcMain.handle('export-inventory-pdf', () => apiFileRequest('/reportes/inventario/pdf'));
      ipcMain.handle('export-sales-pdf', () => apiFileRequest('/reportes/ventas/pdf'));
      ipcMain.handle('export-general-pdf', () => apiFileRequest('/reportes/general/pdf'));
      ipcMain.handle('export-sales-csv', () => apiFileRequest('/ventas/csv'));

      // General
      ipcMain.on('open-external', (event, url) => {
          shell.openExternal(url);
      });

      ipcMain.handle('select-image', async () => {
          const result = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                  { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
              ]
          });
          return result.filePaths[0];
      });
  }

  app.whenReady().then(() => {
      startServer();
      setupIpcHandlers();
      createWindow();

      app.on('activate', () => {
          if (BrowserWindow.getAllWindows().length === 0) {
              createWindow();
          }
      });
  });

  app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
          app.quit();
      }
  });
}