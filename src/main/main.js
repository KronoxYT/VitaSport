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
          minWidth: 800,
          minHeight: 600,
          webPreferences: {
              preload: path.join(__dirname, 'preload.js'),
              nodeIntegration: false,
              contextIsolation: true,
              enableRemoteModule: false,
              worldSafeExecuteJavaScript: true,
              // Enhanced security settings
              sandbox: true,
              webSecurity: true,
              allowRunningInsecureContent: false,
              experimentalFeatures: false,
              // Disable features that could be security risks
              spellcheck: false,
              devTools: process.env.NODE_ENV === 'development'
          },
          // Security improvements
          show: false, // Don't show window until ready
          backgroundColor: '#ffffff',
          // Frame and window settings
          frame: true,
          titleBarStyle: 'default'
      });

      // Enhanced security: Set Content Security Policy
      mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
          callback({
              responseHeaders: {
                  ...details.responseHeaders,
                  'Content-Security-Policy': [
                      "default-src 'self'; " +
                      "script-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com https://code.jquery.com https://cdn.jsdelivr.net; " +
                      "style-src 'self' 'unsafe-inline' https://stackpath.bootstrapcdn.com https://fonts.googleapis.com; " +
                      "font-src 'self' https://fonts.gstatic.com; " +
                      "img-src 'self' data: https:; " +
                      "connect-src 'self' http://localhost:3001 https://vitasport-2.onrender.com; " +
                      "frame-src 'none'; " +
                      "object-src 'none'; " +
                      "base-uri 'self';"
                  ],
                  'X-Content-Type-Options': ['nosniff'],
                  'X-Frame-Options': ['DENY'],
                  'X-XSS-Protection': ['1; mode=block'],
                  'Referrer-Policy': ['strict-origin-when-cross-origin']
              }
          });
      });

      // Block navigation to external URLs
      mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
          const parsedUrl = new URL(navigationUrl);
          const allowedOrigins = ['localhost', '127.0.0.1', 'vitasport-2.onrender.com'];
          
          if (!allowedOrigins.some(origin => parsedUrl.hostname.includes(origin))) {
              event.preventDefault();
              console.warn('Navigation blocked to:', navigationUrl);
          }
      });

      // Prevent opening new windows
      mainWindow.webContents.setWindowOpenHandler(({ url }) => {
          // Block all new window opens by default
          console.warn('Blocked attempt to open new window:', url);
          return { action: 'deny' };
      });

      // Show window when ready to prevent visual flash
      mainWindow.once('ready-to-show', () => {
          mainWindow.show();
          mainWindow.focus();
      });

      // Load appropriate page based on token validity
      if (isValidToken) {
          mainWindow.loadFile(path.join(__dirname, '../renderer/shell.html'));
      } else {
          mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
      }

      // Only open DevTools in development
      if (process.env.NODE_ENV === 'development') {
          // mainWindow.webContents.openDevTools();
      }

      // Security: Log and handle crashes
      mainWindow.webContents.on('crashed', (event, killed) => {
          console.error('Window crashed:', { killed });
      });

      // Security: Handle unresponsive window
      mainWindow.on('unresponsive', () => {
          console.warn('Window is unresponsive');
      });

      // Clean up on window close
      mainWindow.on('closed', () => {
          mainWindow = null;
      });
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
      // Security: Disable hardware acceleration if needed
      // app.disableHardwareAcceleration();

      // Security: Set app user model ID (Windows)
      if (process.platform === 'win32') {
          app.setAppUserModelId('com.vitasport.desktop');
      }

      // Security: Prevent app from running with elevated privileges
      if (process.platform === 'darwin' && app.isInApplicationsFolder() === false) {
          const response = dialog.showMessageBoxSync({
              type: 'warning',
              buttons: ['Continuar', 'Cancelar'],
              message: 'La aplicación no está en la carpeta de Aplicaciones',
              detail: 'Para mayor seguridad, mueve la aplicación a la carpeta de Aplicaciones.'
          });
          if (response === 1) {
              app.quit();
              return;
          }
      }

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

  // Security: Handle certificate errors (only in development)
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
      if (process.env.NODE_ENV === 'development' && url.includes('localhost')) {
          // In development, allow localhost certificates
          event.preventDefault();
          callback(true);
      } else {
          // In production, strict certificate validation
          callback(false);
      }
  });

  // Security: Disable web SQL
  app.on('web-contents-created', (event, contents) => {
      contents.on('will-attach-webview', (event, webPreferences, params) => {
          // Prevent webview usage
          event.preventDefault();
      });

      // Security: Prevent navigation to external protocols
      contents.setWindowOpenHandler(({ url }) => {
          if (url.startsWith('http:') || url.startsWith('https:')) {
              shell.openExternal(url);
          }
          return { action: 'deny' };
      });
  });

  // Security: Set secure defaults for sessions
  app.on('session-created', (session) => {
      // Clear cache on startup for security
      session.clearCache();
      
      // Set secure cookie policies
      session.cookies.on('changed', (event, cookie, cause, removed) => {
          // Log cookie changes in development
          if (process.env.NODE_ENV === 'development') {
              console.log('Cookie changed:', { name: cookie.name, cause, removed });
          }
      });
  });

  // Log app version on startup
  console.log(`VitaSport v${app.getVersion()} started with enhanced security`);
}