const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Variables globales
let mainWindow;
let isDev = process.argv.includes('--dev');

// Configuración de la aplicación
const APP_CONFIG = {
  width: 1200,
  height: 800,
  minWidth: 900,
  minHeight: 600,
  title: 'EcoTrak App - Sistema de Gestión de Reciclaje'
};

/**
 * Crear ventana principal
 */
function createMainWindow() {
  console.log('🚀 Creando ventana principal...');
  
  mainWindow = new BrowserWindow({
    width: APP_CONFIG.width,
    height: APP_CONFIG.height,
    minWidth: APP_CONFIG.minWidth,
    minHeight: APP_CONFIG.minHeight,
    title: APP_CONFIG.title,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false,
      preload: path.join(__dirname, '../services/preload.js')
    },
    icon: path.join(__dirname, '../../assets/icons/icon2.ico'),
    show: false, // No mostrar hasta que esté listo
    titleBarStyle: 'default',
    frame: true,
    backgroundColor: '#f0fdf4' // Color de fondo verde suave
  });

  const preloadPath = path.join(__dirname, '../preload.js');
  console.log('🔍 Ruta preload completa:', preloadPath);

  const fs = require('fs');
  console.log('📁 Archivo preload existe:', fs.existsSync(preloadPath));

  if (!fs.existsSync(preloadPath)) {
    console.error('❌ ARCHIVO PRELOAD NO ENCONTRADO en:', preloadPath);
  } 

  // Cargar la interfaz
  const htmlPath = path.join(__dirname, '../renderer/index.html');
  console.log('📄 Cargando HTML desde:', htmlPath);
  
  mainWindow.loadFile(htmlPath);

  // Mostrar cuando esté listo
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Ventana principal lista');
    mainWindow.show();
    
    // Abrir DevTools en modo desarrollo
    if (isDev) {
      mainWindow.webContents.openDevTools();
      console.log('🔧 DevTools abierto (modo desarrollo)');
    }
  });

  // Manejar cierre de ventana
  mainWindow.on('closed', () => {
    console.log('❌ Ventana principal cerrada');
    mainWindow = null;
  });

  // Manejar enlaces externos
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Manejar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Error cargando:', errorCode, errorDescription);
  });

  console.log('✅ Ventana principal creada exitosamente');
}

/**
 * Configurar menú de la aplicación
 */
function setupMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Nueva Base de Datos',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-nueva-bd');
          }
        },
        {
          label: 'Abrir Base de Datos',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Seleccionar archivo Excel',
              filters: [
                { name: 'Archivos Excel', extensions: ['xlsx', 'xls'] }
              ],
              properties: ['openFile']
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-abrir-bd', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Guardar',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-guardar');
          }
        },
        {
          label: 'Guardar Como...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Guardar base de datos como...',
              defaultPath: path.join(os.homedir(), 'Documents', 'Reciclaje_Database.xlsx'),
              filters: [
                { name: 'Archivos Excel', extensions: ['xlsx'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-guardar-como', result.filePath);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exportar Reportes',
          submenu: [
            {
              label: 'Reporte Completo',
              click: () => {
                mainWindow.webContents.send('menu-exportar-reporte', 'completo');
              }
            },
            {
              label: 'Reporte por Fechas',
              click: () => {
                mainWindow.webContents.send('menu-exportar-reporte', 'fechas');
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Registro',
      submenu: [
        {
          label: 'Nuevo Registro',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('menu-nuevo-registro');
          }
        },
        {
          label: 'Ver Historial',
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            mainWindow.webContents.send('menu-ver-historial');
          }
        }
      ]
    },
    {
      label: 'Salidas',
      submenu: [
        {
          label: 'Nueva Salida',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('menu-nueva-salida');
          }
        },
      ]
    },
    {
      label: 'Ver',
      submenu: [
        {
          label: 'Abrir DevTools',
            accelerator: 'F12',
            click: () => {
                mainWindow.webContents.openDevTools();
              }
        },
        {
          label: 'Recargar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom Actual',
          role: 'resetzoom'
        },
        {
          label: 'Acercar',
          role: 'zoomin'
        },
        {
          label: 'Alejar',
          role: 'zoomout'
        },
        { type: 'separator' },
        {
          label: 'Pantalla Completa',
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: 'Herramientas',
      submenu: [
        {
          label: 'Backup Automático',
          type: 'checkbox',
          checked: true,
          click: (item) => {
            mainWindow.webContents.send('menu-toggle-backup', item.checked);
          }
        },
        { type: 'separator' },
        {
          label: 'Configuración',
          click: () => {
            mainWindow.webContents.send('menu-configuracion');
          }
        }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Manual de Usuario',
          click: () => {
            mainWindow.webContents.send('menu-manual');
          }
        },
        {
          label: 'Atajos de Teclado',
          click: () => {
            mainWindow.webContents.send('menu-atajos');
          }
        },
        { type: 'separator' },
        {
          label: 'Acerca de EcoTrak',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de EcoTrak Desktop',
              message: 'EcoTrak App v1.0.0',
              detail: 'Sistema de gestión de reciclaje para escritorio.\n\nDesarrollado Por Jafet sanchez ruiz.\n\n© 2025 - Todos los derechos reservados.',
              icon: path.join(__dirname, '../../assets/icons/icon3.ico')
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  console.log('🎯 Menú configurado exitosamente');
}

/**
 * Inicializar aplicación
 */
app.whenReady().then(() => {
  console.log('🚀 Aplicación Electron iniciando...');
  console.log('📁 Directorio de trabajo:', __dirname);
  console.log('🏠 Directorio home:', os.homedir());
  console.log('💻 Plataforma:', process.platform);
  console.log('🔧 Modo desarrollo:', isDev);
  
  createMainWindow();
  setupMenu();

  // En macOS, recrear ventana cuando se hace clic en el dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
  
  console.log('✅ Aplicación iniciada exitosamente');
});

/**
 * Cerrar aplicación cuando todas las ventanas están cerradas
 */
app.on('window-all-closed', () => {
  console.log('🔒 Todas las ventanas cerradas');
  
  // En macOS, mantener la aplicación corriendo
  if (process.platform !== 'darwin') {
    console.log('👋 Cerrando aplicación');
    app.quit();
  }
});

/**
 * Manejar segundo intento de abrir la aplicación
 */
app.on('second-instance', () => {
  console.log('⚡ Segunda instancia detectada');
  
  // Enfocar la ventana existente
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

/**
 * Prevenir múltiples instancias
 */
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('❌ Ya existe una instancia corriendo');
  app.quit();
} else {
  console.log('🔐 Lock obtenido - instancia única');
}

/**
 * Configuración de seguridad
 */
app.on('web-contents-created', (event, contents) => {
  // Prevenir navegación a sitios externos
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'file://') {
      console.log('🚫 Navegación externa bloqueada:', navigationUrl);
      event.preventDefault();
    }
  });
});

console.log('📋 Proceso principal configurado exitosamente');