// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  dialog,
  IpcMainEvent,
  MenuItemConstructorOptions,
  shell,
  ipcRenderer,
} from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import net from 'net';

const LoadingStages = {
  Initializing: 30,
  BackendSetup: 65,
  Finalizing: 100,
};

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const isMac = process.platform === 'darwin';

let loaderWindow: BrowserWindow;
let mainWindow: BrowserWindow;

type AIConsoleWindow = {
  browserWindow: BrowserWindow;
  backendProcess?: any;
  port?: number;
};

const windowManager: {
  windows: AIConsoleWindow[];
  addWindow: (browserWindow: BrowserWindow) => void;
  removeWindow: (targetWindow: BrowserWindow) => void;
  findBackendByWindow: (targetWindow: BrowserWindow) => any;
} = {
  windows: [],
  addWindow: (browserWindow) => {
    windowManager.windows.push({
      browserWindow,
      backendProcess: undefined,
      port: undefined,
    });
  },
  removeWindow: (targetWindow) => {
    windowManager.windows = windowManager.windows.filter(({ browserWindow }) => browserWindow !== targetWindow);
  },
  findBackendByWindow: (targetWindow) => {
    const window = windowManager.windows.find(({ browserWindow }) => browserWindow === targetWindow);
    return window ? window.backendProcess : null;
  },
};

async function log(browserWindow: BrowserWindow, message: string) {
  if (browserWindow.isDestroyed()) {
    return;
  }

  browserWindow.webContents.send('log', message);
}

async function error(browserWindow: BrowserWindow, message: string) {
  if (browserWindow.isDestroyed()) {
    return;
  }

  browserWindow.webContents.send('error', message);
}

async function waitForServerToStart(window: AIConsoleWindow) {
  const RETRY_INTERVAL = 100;
  log(window.browserWindow, `Waiting for backend to start on port ${window.port}`);

  const interval = setInterval(() => {
    fetch(`http://0.0.0.0:${window.port}/api/ping`)
      .then(async () => {
        log(window.browserWindow, `Backend is up and running`);
        updateLoadingProgress(LoadingStages.Finalizing);
        clearInterval(interval);
        setTimeout(() => {
          loaderWindow.hide();
          mainWindow.show();
        }, 500);
        window.browserWindow.webContents.send('set-backend-port', window.port);
      })
      .catch((e) => {});
  }, RETRY_INTERVAL);
}

async function tryPort(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () => resolve(false));
    server.listen(port, '0.0.0.0', () => {
      server.close(() => {
        resolve(true);
      });
    });
  });
}

let nextPort = 1024;
async function findEmptyPort(startingFrom = 1024, endingAt = 65535) {
  let currentPort = nextPort;

  while (true) {
    if (await tryPort(currentPort)) {
      nextPort = currentPort + 1;
      return currentPort;
    }
    currentPort++;
    if (currentPort > endingAt) {
      currentPort = startingFrom;
    }
    if (currentPort == nextPort) {
      break;
    }
  }

  throw new Error('No empty port found within the range.');
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#111111',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
    icon: '../assets/icon.png',
    show: false,
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Add an event listener to handle the main window's close event.
  mainWindow.on('closed', () => {
    const backendProcess = windowManager.findBackendByWindow(mainWindow);
    if (backendProcess) {
      backendProcess.kill();
    }
    windowManager.removeWindow(mainWindow);
  });

  windowManager.addWindow(mainWindow);

  return mainWindow;
}

const updateLoadingProgress = (progress: number) => {
  if (loaderWindow) {
    loaderWindow.webContents.send('progress-update', progress);
  }
};

const sendVersionInfo = () => {
  if (loaderWindow) {
    loaderWindow.webContents.send('get-version', app.getVersion());
  }
};

function createLoaderWindow() {
  loaderWindow = new BrowserWindow({
    width: 600,
    height: 350,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loaderWindow.loadFile(path.join(__dirname, './src/loader.html'));

  loaderWindow.webContents.once('dom-ready', () => {
    sendVersionInfo();
    setTimeout(() => {
      updateLoadingProgress(LoadingStages.Initializing);
    }, 150);
  });
  loaderWindow.on('closed', () => {
    loaderWindow = null;
  });
}

function findPathToPython() {
  let pythonPath;

  if (process.platform === 'win32') {
    pythonPath = path.join('python', 'python.exe');
  } else {
    pythonPath = path.join('python', 'bin', 'python3.10');
  }

  if (app.isPackaged) {
    return path.join(process.resourcesPath, pythonPath);
  } else {
    return path.join(__dirname, '../..', pythonPath);
  }
}

const { updateElectronApp } = require('update-electron-app');
updateElectronApp();

const handleDirPicker = async (event: IpcMainEvent) => {
  const window: AIConsoleWindow | undefined = windowManager.windows.find(
    (win) => event.sender === win.browserWindow.webContents
  );

  if (!window) {
    return;
  }

  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(window.browserWindow, {
      properties: ['openDirectory', 'createDirectory'],
    });

    if (!canceled && filePaths?.length) {
      return filePaths[0];
    }
  } catch (error) {
    error(window.browserWindow, `Error from backend process: ${error.message}`);
  }
};

ipcMain.on('request-backend-port', async (event) => {
  updateLoadingProgress(LoadingStages.BackendSetup);
  for (const window of windowManager.windows) {
    if (event.sender === window.browserWindow.webContents) {
      window.port = await findEmptyPort();

      window.backendProcess = spawn(findPathToPython(), [
        '-m',
        'aiconsole.electron',
        `--port=${window.port}`,
        `--origin=${MAIN_WINDOW_VITE_DEV_SERVER_URL}`,
      ]);

      //close the app when backend process exits
      window.backendProcess.on('exit', () => {
        log(window.browserWindow, 'Backend process exited');
      });

      window.backendProcess.on('error', (e: Error) => {
        error(window.browserWindow, `Error from backend process: ${e.message}`);
      });

      window.backendProcess.stdout.on('data', (data: Buffer) => {
        //data ends with \n ? strip it
        if (data[data.length - 1] == 10) {
          data = Uint8Array.prototype.slice.call(data, 0, -1);
        }
        log(window.browserWindow, `${data}`);
        console.log(`${data}`);
      });

      window.backendProcess.stderr.on('data', (data: Buffer) => {
        //data ends with \n ? strip it
        if (data[data.length - 1] == 10) {
          data = Uint8Array.prototype.slice.call(data, 0, -1);
        }
        // dialog.showErrorBox("Backend Error", data.toString());
        error(window.browserWindow, `${data}`);
      });

      window.backendProcess.on('exit', (code: string) => {
        log(window.browserWindow, `FastAPI server exited with code ${code}`);
      });

      //wait for the server to come up online
      await waitForServerToStart(window);
    }
  }
});

app.whenReady().then(() => {
  ipcMain.handle('open-dir-picker', handleDirPicker);
  ipcMain.handle('open-finder', async (event, path) => {
    shell.showItemInFolder(path);
  });
  createLoaderWindow();

  app.on('will-quit', () => {
    windowManager.windows.forEach(({ backendProcess }) => {
      backendProcess.kill();
    });
  });

  app.on('window-all-closed', function () {
    app.quit();
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  createWindow();

  // main/index.js
  if (require('electron-squirrel-startup') === true) app.quit();
});
// This should be placed in your main process code
app.on('ready', () => {
  if (isMac) {
    // Define a template for your menu
    const dockMenu = Menu.buildFromTemplate([
      {
        label: 'New Window',
        click() {
          createWindow();
        },
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click(_, browserWindow) {
          browserWindow.webContents.send('log', 'Settings');
          // Code to open settings
        },
      },
    ]);

    // Set the menu for the dock
    app.dock.setMenu(dockMenu);
  }
});

app.on('ready', () => {
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          click() {
            createWindow();
          },
        },
        { role: 'quit' },
      ],
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
        { role: 'delete' },
        { role: 'selectAll' },
      ],
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
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : [{ role: 'close' }]),
        {
          label: 'Show Developer Tools',
          click(_, browserWindow: BrowserWindow) {
            browserWindow.webContents.openDevTools();
          },
        },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/10clouds/aiconsole');
          },
        },
      ],
    },
  ] as MenuItemConstructorOptions[];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});
