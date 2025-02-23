const {
  ipcMain,
  app,
  BrowserWindow,
  dialog,
  Tray,
  Menu,
  globalShortcut,
} = require('electron');
const { exec, spawn } = require('child_process');
const path = require('path');
const {
  checkDockerInstallation,
  runDockerCommand,
  dockerImageExists,
  dockerContainerExists,
  dockerContainerIsRunning,
  cleanDockerContainers,
  loadPlatform,
} = require('./helper');

const ViewManager = require('./view');

// Global variables to keep track of the docker images
let runnerDockerImage = null;
let platformDockerImage = null;
let cleanup = false;

let viewManager = null;

// Create the browser window
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });
  viewManager = new ViewManager(win);

  win.loadFile(path.join(__dirname, '../dist/index.html'));
  win.webContents.on('did-finish-load', async () => {
    try {
      await checkDockerInstallation();
    } catch (error) {
      console.error('Docker check failed:', error);
    }
  });

  win.webContents.setWindowOpenHandler(({ url, frameName, disposition }) => {
    // Only intercept window.open() calls
    if (disposition === 'new-window') {
      console.log('window.open intercepted:', url);
      win.webContents.send('new-window-open', url);
      return { action: 'deny' };
    }
    // Allow target="_blank" links
    if (disposition === 'foreground-tab') {
      return { action: 'allow' };
    }
    return { action: 'deny' };
  });

  // Register a global shortcut to open DevTools
  globalShortcut.register('CmdOrCtrl+Shift+C', () => {
    win.webContents.openDevTools({ mode: 'detach' });
  });
}

function onBeforeQuit(event) {
  if (!cleanup) {
    cleanup = true;
    event.preventDefault();
    // Get the main window and send the message through it
    const mainWindow = BrowserWindow.getFocusedWindow();
    if (mainWindow) {
      mainWindow.webContents.send(
        'install-log',
        `Cleaning up containers and exiting. Please wait...`
      );
    }
    const cleanupTasks = [];
    if (runnerDockerImage) {
      cleanupTasks.push(cleanDockerContainers(runnerDockerImage, 'rm'));
    }
    if (platformDockerImage) {
      cleanupTasks.push(cleanDockerContainers(platformDockerImage, 'stop'));
    }
    Promise.all(cleanupTasks)
      .then(() => {
        app.removeListener('before-quit', onBeforeQuit);
        app.quit();
      })
      .catch((error) => {
        console.error('Error during cleanup:', error);
        app.removeListener('before-quit', onBeforeQuit);
        app.quit();
      });
  }
}

app.whenReady().then(() => {
  createWindow();
  // Define a menu template with devtools toggle using Chrome's default hotkey
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'toggleDevTools', accelerator: 'Cmd+Alt+I' },
              {
                label: 'Inspect Element',
                accelerator: 'Cmd+Shift+C',
                click: (menuItem, browserWindow) => {
                  if (browserWindow) {
                    browserWindow.webContents.inspectElement(0, 0);
                  }
                },
              },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : [
          {
            label: 'View',
            submenu: [
              { role: 'toggleDevTools', accelerator: 'Cmd+Alt+I' },
              {
                label: 'Inspect Element',
                accelerator: 'Ctrl+Shift+C',
                click: (menuItem, browserWindow) => {
                  if (browserWindow) {
                    browserWindow.webContents.inspectElement(0, 0);
                  }
                },
              },
            ],
          },
        ]),
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

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

// Clean up containers when the application is about to quit
app.on('before-quit', onBeforeQuit);

ipcMain.on('close-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});

ipcMain.on('minimize-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.on('maximize-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.on('check-dorkder-installation', () => {
  try {
    checkDockerInstallation();
  } catch (e) {
    console.error(e);
  }
});

ipcMain.on(
  'start',
  async (event, { runnerImage, platformImage, port, update = false }) => {
    try {
      // Store the docker image parameters globally for cleanup
      runnerDockerImage = runnerImage;
      platformDockerImage = platformImage;

      // Pull platform docker image
      const platformExists = await dockerImageExists(platformImage);
      const platformRunning = await dockerContainerIsRunning(
        'cityflow_platform'
      );

      if (!platformExists) {
        await runDockerCommand(['pull', platformImage], 'pull platform', event);
      } else if (update) {
        const containerExists = await dockerContainerExists(
          'cityflow_platform'
        );
        containerExists &&
          (await runDockerCommand(
            ['rm', 'cityflow_platform'],
            'remove container',
            event
          ));
        await runDockerCommand(['pull', platformImage], 'pull platform', event);
      } else if (platformRunning) {
        console.log('Platform is already running');
        event.reply('install-log', 'Platform is already running');
        return loadPlatform(port);
      } else {
        console.log(
          `Platform image ${platformImage} already exists, skipping pull.`
        );
        event.reply(
          'install-log',
          `Platform image ${platformImage} already exists, skipping pull.`
        );
      }
      // Pull runner docker image
      const runnerExists = await dockerImageExists(runnerImage);

      if (runnerExists && !update) {
        console.log(
          `Runner image ${runnerImage} already exists, skipping pull.`
        );
        event.reply(
          'install-log',
          `Runner image ${runnerImage} already exists, skipping pull.`
        );
      } else {
        await runDockerCommand(['pull', runnerImage], 'pull runner', event);
      }

      // Build docker run arguments
      const dockerArgs = [
        'run',
        // '-d',
        '--name',
        'cityflow_platform',
        '-p',
        `${port}:3000`,
        '-v',
        '/var/run/docker.sock:/var/run/docker.sock',
        '-v',
        `./temp:/cityflow_platform/cityflow_executor/code`,
        '-v',
        `./data:/cityflow_platform/cityflow_database/data`,
        '-v',
        `./source:/cityflow_platform/cityflow_database/source`,
        platformImage,
      ];

      // Check if the container exists
      const containerExists = await dockerContainerExists('cityflow_platform');
      if (containerExists) {
        console.log('Platform container already exists, starting...');
        event.reply(
          'install-log',
          'Platform container already exists, starting...'
        );
        try {
          await runDockerCommand(
            ['start', 'cityflow_platform'],
            'start cityflow',
            event
          ).then(() => {
            return runDockerCommand(
              ['logs', '-f', 'cityflow_platform'],
              'container logs',
              event,
              port
            );
          });
        } catch (error) {
          console.log('Error starting platform container:', error);
          console.log('Starting new container...');
          event.reply(
            'install-log',
            'Container existence check failed, creating new container...'
          );
          await runDockerCommand(dockerArgs, 'start cityflow', event, port);
        }
      } else {
        console.log('Creating new container...');
        event.reply('install-log', 'creating new container...');
        runDockerCommand(dockerArgs, 'start cityflow', event, port);
      }
    } catch (error) {
      dialog.showErrorBox('Error', error.message);
    }
  }
);

ipcMain.handle('create-tab', async (event, { id, url }) => {
  viewManager.createView(id, url);
});

ipcMain.handle('switch-tab', async (event, { id }) => {
  viewManager.switchView(id);
});

ipcMain.handle('close-tab', async (event, { id }) => {
  viewManager.removeView(id);
});
