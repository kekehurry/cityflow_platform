const {
  ipcMain,
  app,
  BrowserWindow,
  dialog,
  Menu,
  globalShortcut,
  shell,
} = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const {
  runDockerCommand,
  dockerImageExists,
  dockerContainerExists,
  dockerContainerIsRunning,
  cleanDockerContainers,
  loadPlatform,
  initMachine,
  stopMachine,
  resetMachine,
  pruneMachine,
  getAppPath,
} = require('./helper');
const fs = require('fs');
const os = require('os');
const ViewManager = require('./view');
const template = require('./menu');

// Global variables to keep track of the docker images
let runnerDockerImage = null;
let platformDockerImage = null;
let cleanup = false;
let viewManager = null;

// Create the directory if it doesn't exist
// const resourcePath = process.resourcesPath;
const appDir = getAppPath();
const tempDir = path.join(appDir, 'usr', 'temp');
const dataDir = path.join(appDir, 'usr', 'data');
const sourceDir = path.join(appDir, 'usr', 'source');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { mode: 0o777, recursive: true });
}
if (!fs.existsSync(sourceDir)) {
  fs.mkdirSync(sourceDir, { recursive: true });
}

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
      // init  machine
      initMachine();
    } catch (error) {
      console.error('Docker check failed:', error.message);
      dialog.showErrorBox('Error', error.message);
    }
  });
  win.webContents.setWindowOpenHandler(({ url, frameName, disposition }) => {
    win.webContents.send('new-window-open', url);
    return { action: 'deny' };
  });

  // Register a global shortcut to open DevTools
  globalShortcut.register('CmdOrCtrl+Shift+C', () => {
    if (viewManager.activeViewId) {
      const activeView = viewManager.views.get(viewManager.activeViewId);
      if (activeView) {
        activeView.webContents.openDevTools({ mode: 'detach' });
      }
    } else {
      win.webContents.openDevTools({ mode: 'detach' });
    }
  });

  autoUpdater.autoDownload = false;
  setImmediate(() => {
    autoUpdater
      .checkForUpdatesAndNotify()
      .then((updateInfo) => {
        if (updateInfo) {
          dialog.showMessageBox(win, {
            type: 'info',
            title: 'Update',
            message: updateInfo,
          });
        }
        console.log('Update info:', updateInfo);
      })
      .catch((error) => {
        console.error('Update check error:', error);
      });
  });
}

async function onBeforeQuit(event, stopServer = false) {
  if (!cleanup) {
    cleanup = true;
    event.preventDefault();
    // Get the main window and send the message through it
    const mainWindow = BrowserWindow.getAllWindows()[0];
    mainWindow &&
      mainWindow.webContents.send(
        'install-log',
        `Cleaning up containers and exiting. Please wait...`
      );
    const cleanupTasks = [];
    if (runnerDockerImage) {
      cleanupTasks.push(cleanDockerContainers(runnerDockerImage, 'rm'));
    }
    if (stopServer) {
      await cleanDockerContainers(platformDockerImage, 'rm');
      await stopMachine();
      app.removeListener('before-quit', onBeforeQuit);
      app.quit();
    }
    await Promise.all(cleanupTasks).finally(async () => {
      mainWindow &&
        mainWindow.webContents.send('install-log', `Stopping machine...`);
      app.removeListener('before-quit', onBeforeQuit);
      app.quit();
    });
  }
}

app.whenReady().then(() => {
  createWindow();
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
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.close();
});

ipcMain.on('minimize-window', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.minimize();
});

ipcMain.on('maximize-window', () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
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
      const platformRunning =
        await dockerContainerIsRunning('cityflow_platform');

      if (!platformExists) {
        await runDockerCommand(
          ['pull', '--platform', 'linux/amd64', platformImage],
          'pull platform',
          event
        );
      } else if (update) {
        const containerExists =
          await dockerContainerExists('cityflow_platform');
        containerExists &&
          (await runDockerCommand(
            ['rm', '-f', 'cityflow_platform'],
            'remove container',
            event
          ));
        await runDockerCommand(
          ['pull', '--platform', 'linux/amd64', platformImage],
          'pull platform',
          event
        );
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
        await runDockerCommand(
          ['pull', '--platform', 'linux/amd64', runnerImage],
          'pull runner',
          event
        );
      }

      // Build docker run arguments
      const dockerArgs = [
        'run',
        // '-d',
        '--privileged',
        '--name',
        'cityflow_platform',
        '-p',
        `${port}:3000`,
        '-v',
        '/var/run/docker.sock:/var/run/docker.sock',
        '-v',
        `${tempDir}:/cityflow_platform/cityflow_executor/code:rw`,
        '-v',
        `${dataDir}:/data:rw`,
        '-v',
        `${sourceDir}:/cityflow_platform/cityflow_database/source:rw`,
        '-e',
        `DEFAULT_RUNNER=${runnerImage}`,
        '--platform',
        'linux/amd64',
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

ipcMain.handle('stop-server', async (event, { runnerImage, platformImage }) => {
  runnerDockerImage = runnerImage;
  platformDockerImage = platformImage;
  await onBeforeQuit(event, true);
});

ipcMain.handle('reset-machine', async (event, data) => {
  resetMachine();
});

ipcMain.handle('prune-machine', async (event, data) => {
  pruneMachine();
});

// listen for update events
autoUpdater.on('update-available', (info) => {
  const win = BrowserWindow.getAllWindows()[0];
  dialog
    .showMessageBox(win, {
      type: 'info',
      buttons: ['Download', 'Cancel'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update Available',
      message:
        'A new cityflow launcher update is available. Do you want to download it now?',
    })
    .then(({ response }) => {
      if (response === 0) {
        try {
          win?.webContents?.send('update-available');
          const updateUrl =
            'https://github.com/kekehurry/cityflow_platform/releases';
          shell.openExternal(updateUrl);
        } catch (error) {
          dialog.showErrorBox('Error opening external link:', info.url);
        }
      }
    });
});
