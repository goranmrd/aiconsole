const { app, BrowserWindow, Tray } = require('electron');
const isPackaged = require('electron-is-packaged').isPackaged;
const { spawn } = require('child_process');
const path = require('path');

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
    //titleBarStyle: 'hidden',
    icon: '/Users/maciel/Projects/aiconsole/web/electron/icon.png',
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Add an event listener to handle the main window's close event.
  mainWindow.on('closed', () => {
    // Stop the FastAPI server when the Electron app is closed
    app.quit();
  });
}

//const { updateElectronApp } = require('update-electron-app')
//updateElectronApp()

let path_to_python;

if (isPackaged) {
  path_to_python = path.join(process.resourcesPath, 'python/bin/python3.9');
} else {
  path_to_python = path.join(__dirname, '../..', 'electron/python/bin/python3.9');
}

app.whenReady().then(() => {
  // Run python with module aiconsole.main
  const backendProcess = spawn(path_to_python, ['-m', 'aiconsole.electron']);

  //close the app when backend process exits
  backendProcess.on('exit', () => {
    app.quit();
  });

  backendProcess.stdout.on('data', (data) => {
    //data ends with \n ? strip it
    if (data[data.length - 1] == 10) {
      data = data.slice(0, -1);
    }
    console.log(`${data}`);

    if (data.toString().includes('running on http://')) {
      app.whenReady().then(createWindow);
    }
  });

  backendProcess.stderr.on('data', (data) => {
    //data ends with \n ? strip it
    if (data[data.length - 1] == 10) {
      data = data.slice(0, -1);
    }
    console.error(data);
  });

  backendProcess.on('exit', (code) => {
    console.log(`FastAPI server exited with code ${code}`);
  });

  // Close the FastAPI process when the Electron app closes
  app.on('will-quit', () => {
    backendProcess.kill();
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
