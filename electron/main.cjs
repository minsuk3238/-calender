const { app, BrowserWindow, screen, Tray, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let tray = null;

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  // Create a floating widget-like window
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    x: width - 420,
    y: height - 620,
    frame: false, // No title bar
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the Vite dev server in development, or the local html file in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173?mode=widget');
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../dist/index.html')}?mode=widget`);
  }

  // Prevent closing the app when hitting the X (hide it instead for a widget feel)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  // Use a default icon or generate an empty one for the tray
  // In a real app you'd want an actual icon.ico file here
  tray = new Tray(path.join(__dirname, 'icon.png')); // We will need to place an icon.png here
  const contextMenu = Menu.buildFromTemplate([
    { label: '캘린더 열기', click: () => mainWindow.show() },
    { label: '숨기기', click: () => mainWindow.hide() },
    { type: 'separator' },
    { label: '종료', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  
  tray.setToolTip('팀 캘린더 MVP');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  // createTray(); // Icon is needed to enable tray. Skipping for MVP, focusing on window.
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
