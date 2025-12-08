const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const ChatService = require('./chat-service');

let mainWindow;
const chatService = new ChatService();

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#1a1a2e',
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    frame: true
  });

  // Load the index.html
  mainWindow.loadFile('index.html');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  // Create application menu
  createMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Chat',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-chat');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Chat',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('export-chat');
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.send('show-about');
          }
        },
        {
          label: 'Documentation',
          click: () => {
            require('electron').shell.openExternal('https://github.com/your-repo');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('send-message', async (event, message, sessionId) => {
  try {
    console.log('=== MAIN.JS IPC HANDLER ===');
    console.log('Received message:', message);
    console.log('Session ID:', sessionId);
    console.log('Calling chatService.sendMessage...');
    
    const response = await chatService.sendMessage(message, sessionId);
    
    console.log('ChatService response:', response);
    console.log('========================');
    
    return {
      success: true,
      response: response,
      sessionId: sessionId
    };
  } catch (error) {
    console.error('=== MAIN.JS ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.error('==================');
    
    // Return error silently for fallback handling in renderer
    return {
      success: false,
      error: error.message
    };
  }
});

ipcMain.handle('clear-session', async (event, sessionId) => {
  try {
    await chatService.clearSession(sessionId);
    return { success: true };
  } catch (error) {
    console.error('IPC clear-session error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-history', async (event, sessionId) => {
  try {
    const history = await chatService.getChatHistory(sessionId);
    return { success: true, history: history };
  } catch (error) {
    console.error('IPC get-history error:', error);
    return { success: false, error: error.message };
  }
});
