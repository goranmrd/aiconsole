const { app, BrowserWindow, Tray } = require('electron');
const { spawn } = require('child_process');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    titleBarStyle: 'hidden',
    icon: '/Users/maciel/Projects/aiconsole/web/electron/icon.png',
  });

  mainWindow.loadURL('http://localhost:8000/');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Add an event listener to handle the main window's close event.
  mainWindow.on('closed', () => {
    // Stop the FastAPI server when the Electron app is closed
    fastapiProcess.kill();
    app.quit();
  });
}

//const appIcon = new Tray('/Users/somebody/images/icon.png')

// Start the FastAPI server
const fastapiProcess = spawn('poetry', ['run', 'aiconsole']);

// Handle FastAPI server process exit
fastapiProcess.on('exit', (code) => {
  console.log(`FastAPI server exited with code ${code}`);
});

// create window when fastapi server is ready
fastapiProcess.stdout.on('data', (data) => {
  if (data.toString().includes('Running on http://')) {
    app.whenReady().then(createWindow);
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.whenReady().then(createWindow);
