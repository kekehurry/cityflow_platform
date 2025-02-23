const http = require('http');
const { exec, spawn } = require('child_process');
const { BrowserWindow, shell, dialog, app } = require('electron');
const path = require('path');

// Helper function to get the path to the Docker executable
function getDockerPath() {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // Use system Docker in development
    switch (process.platform) {
      case 'darwin':
        return '/usr/local/bin/docker';
      case 'linux':
        return '/usr/bin/docker';
      case 'win32':
        return 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe';
      default:
        return 'docker';
    }
  } else {
    // Use bundled Docker in production
    const resourcePath = process.resourcesPath;
    switch (process.platform) {
      case 'darwin':
        return path.join(resourcePath, 'docker', 'darwin', 'docker');
      case 'linux':
        return path.join(resourcePath, 'docker', 'linux', 'docker');
      case 'win32':
        return path.join(resourcePath, 'docker', 'win32', 'docker.exe');
      default:
        return 'docker';
    }
  }
}

// Helper function to check if Docker is available
function checkDockerAvailability() {
  const dockerPath = getDockerPath();
  return new Promise((resolve, reject) => {
    exec(`"${dockerPath}" info`, (error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

// Helper function to check if Docker is installed
let isShowingDockerDialog = false;
async function checkDockerInstallation() {
  try {
    await checkDockerAvailability();
    const dockerPath = getDockerPath();
    exec(`"${dockerPath}" --version`, (err, stdout, stderr) => {
      console.log(stdout);
      const win = BrowserWindow.getAllWindows()[0];
      if (err) {
        win && win.webContents.send('docker-status', false);
      } else {
        win && win.webContents.send('docker-status', stdout);
      }
    });
    return true;
  } catch (error) {
    // Prevent multiple dialogs
    if (isShowingDockerDialog) {
      return false;
    }
    isShowingDockerDialog = true;
    const choice = await dialog.showMessageBox({
      type: 'warning',
      title: 'Docker Not Running',
      message: 'Docker Desktop is not running or not installed.',
      buttons: ['Install Docker', 'Open Docker Desktop', 'Cancel'],
      defaultId: 0,
      cancelId: 2,
    });

    switch (choice.response) {
      case 0:
        // Open Docker Desktop download page
        shell.openExternal('https://www.docker.com/products/docker-desktop');
        app.quit();
        return false;
      case 1:
        // Try to open Docker Desktop
        switch (process.platform) {
          case 'darwin':
            spawn('open', ['/Applications/Docker.app']);
            break;
          case 'win32':
            spawn('cmd', ['/c', 'start', '""', '"Docker Desktop"']);
            break;
        }
        app.quit();
        return false;
      default:
        app.quit();
        return false;
    }
  }
}

// load the cityflow platform in the browser window
function loadPlatform(port) {
  const url = `http://localhost:${port}`;
  console.log(url);
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    // Test the URL to check if the server is ready
    http
      .get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          win.webContents.send('new-window-open', url);
        } else {
          console.log(`Server responded with status ${res.statusCode}`);
        }
        res.resume(); // Drain the response
      })
      .on('error', (err) => {
        console.log(`Server not ready: ${err.message}`);
      });
  }
}

// Helper function to run a docker command with spawn and stream logs
function runDockerCommand(args, logPrefix, event, port = null) {
  return new Promise((resolve, reject) => {
    const dockerPath = getDockerPath();
    const proc = spawn(dockerPath, args);
    proc.stdout.on('data', (data) => {
      const log = data.toString();
      console.log(`[${logPrefix} stdout] ${log}`);
      event.reply('install-log', `[${logPrefix}] ${log}`);
      if (log.includes('Ready')) {
        port && loadPlatform(port);
      }
    });
    proc.stderr.on('data', (data) => {
      const log = data.toString();
      console.log(`[${logPrefix}] ${log}`);
      event.reply('install-log', `[${logPrefix}] ${log}`);
    });
    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `Failed to run docker ${args.join(' ')}. Exit code: ${code}`
          )
        );
      }
      resolve();
    });
  });
}

// check if a docker image exists
function dockerImageExists(image) {
  const dockerPath = getDockerPath();
  return new Promise((resolve) => {
    exec(`${dockerPath} image inspect ${image}`, (err, stdout, stderr) => {
      resolve(!err);
    });
  });
}

// check if a docker container exists
function dockerContainerExists(name) {
  const dockerPath = getDockerPath();
  return new Promise((resolve, reject) => {
    exec(
      `${dockerPath} ps -a --filter "name=^/${name}$" --format "{{.Names}}"`,
      (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(stdout.trim() === name);
      }
    );
  });
}

// check if a docker container is running
function dockerContainerIsRunning(name) {
  const dockerPath = getDockerPath();
  return new Promise((resolve) => {
    exec(
      `${dockerPath} inspect ${name} --format '{{.State.Status}}'`,
      (err, stdout, stderr) => {
        resolve(stdout.trim() == 'running');
      }
    );
  });
}

//clean up the containers
function cleanDockerContainers(dockerImage, action = 'stop') {
  const dockerPath = getDockerPath();
  return new Promise((resolve, reject) => {
    // get all containers with the specified image
    exec(
      `${dockerPath} ps -aq --filter "ancestor=${dockerImage}"`,
      (err, stdout, stderr) => {
        if (err) {
          return reject(`Error fetching containers: ${stderr || err.message}`);
        }

        const containerIds = stdout.split('\n').filter((id) => id);
        if (containerIds.length === 0) {
          return resolve();
        }

        // stop or remove the containers
        const containerActions = containerIds.map((id) => {
          const command =
            action === 'stop'
              ? `${dockerPath} stop ${id}`
              : `${dockerPath} rm -f ${id}`;
          return new Promise((res, rej) => {
            exec(command, (err) => {
              if (err) {
                rej(
                  `Error during container ${action}: ${stderr || err.message}`
                );
              } else {
                res();
              }
            });
          });
        });

        // wait for all container actions to finish
        Promise.all(containerActions).then(resolve).catch(reject);
      }
    );
  });
}

module.exports = {
  checkDockerInstallation,
  checkDockerAvailability,
  runDockerCommand,
  dockerImageExists,
  dockerContainerExists,
  dockerContainerIsRunning,
  cleanDockerContainers,
  loadPlatform,
};
