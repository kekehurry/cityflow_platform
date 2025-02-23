const { ipcMain, app, BrowserWindow, dialog, Tray, Menu } = require('electron');
const { exec, spawn } = require('child_process');
const path = require('path');
const {
  checkDockerAvailability,
  checkDockerInstallation,
  runDockerCommand,
  dockerImageExists,
  dockerContainerExists,
  dockerContainerIsRunning,
  cleanDockerContainers,
  loadPlatform,
} = require('./helper.js');

// Global variables to keep track of the docker images
let runnerDockerImage = null;
let platformDockerImage = null;
let cleanup = false;

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

  win.loadFile(path.join(__dirname, '../dist/index.html'));
  win.webContents.on('did-finish-load', async () => {
    try {
      await checkDockerInstallation();
    } catch (error) {
      console.error('Docker check failed:', error);
    }
  });

  // Intercept new window creation
  win.webContents.setWindowOpenHandler((details) => {
    // Only intercept window.open calls, not anchor tag clicks (target="_blank")
    if (details.disposition === 'new-window') {
      win.webContents.send('new-window-open', { url: details.url });
      return { action: 'deny' };
    }
    return { action: 'allow' };
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
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : [
          {
            label: 'View',
            submenu: [{ role: 'toggleDevTools', accelerator: 'Cmd+Alt+I' }],
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
      if (!platformExists) {
        await runDockerCommand(['pull', platformImage], 'pull platform', event);
      } else {
        const platformRunning = await dockerContainerIsRunning(
          'cityflow_platform'
        );
        if (platformRunning) {
          console.log('Platform is already running');
          return loadPlatform(port);
        } else {
          update
            ? await runDockerCommand(
                ['pull', platformImage],
                'pull platform',
                event
              )
            : event.reply(
                'install-log',
                `Platform image ${platformImage} already exists, skipping pull.`
              );
        }
      }

      // Pull runner docker image
      const runnerExists = await dockerImageExists(runnerImage);
      runnerExists && !update
        ? event.reply(
            'install-log',
            `Runner image ${runnerImage} already exists, skipping pull.`
          )
        : await runDockerCommand(['pull', runnerImage], 'pull runner', event);

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
        runDockerCommand(
          ['start', 'cityflow_platform'],
          'start cityflow',
          event
        ).then(() => {
          // Attach to the logs inside the container
          return runDockerCommand(
            ['logs', '-f', 'cityflow_platform'],
            'container logs',
            event,
            port
          );
        });
      } else {
        runDockerCommand(dockerArgs, 'start cityflow', event);
      }
    } catch (error) {
      dialog.showErrorBox('Error', error.message);
    }
  }
);
