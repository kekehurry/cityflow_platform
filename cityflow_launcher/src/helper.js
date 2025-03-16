const http = require('http');
const { exec, spawn, execSync } = require('child_process');
const { BrowserWindow, shell, dialog, app } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let dockerPath;
let dockerVersion;

function getAppPath() {
  let appDir;
  if (process.platform === 'win32') {
    const exePath = app.getPath('exe');
    const installDir = path.dirname(exePath);
    appDir = path.join(installDir, 'cityflow_platform');
  } else {
    appDir = path.join(os.homedir(), 'cityflow_platform');
  }
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
  return appDir;
}

function getDockerPath() {
  let dockerPath;
  const resourcePath = process.resourcesPath;
  const currentPaths = process.env.PATH.split(path.delimiter);
  const dockerDir = path.join(resourcePath, 'docker', process.platform, 'bin');
  if (!currentPaths.includes(dockerDir)) {
    process.env.PATH = dockerDir + path.delimiter + process.env.PATH;
  }
  if (process.platform === 'win32') {
    dockerPath = path.win32.join(dockerDir, 'podman.exe');
  } else {
    dockerPath = path.posix.join(dockerDir, 'podman');
  }

  // Ensure the directory exists
  const appDir = getAppPath();
  const configDir = path.join(appDir, 'storage', 'config');
  const dataDir = path.join(appDir, 'storage', 'data');
  const runDir = path.join(appDir, 'storage', 'run');

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(runDir)) {
    fs.mkdirSync(runDir, { recursive: true });
  }

  // Create or update containers.conf
  const configFile = path.join(configDir, 'containers.conf');
  // Escape backslashes in dockerDir for Windows paths
  const safeDockerDir = dockerDir.replace(/\\/g, '\\\\');
  const configContent = `[engine]\nhelper_binaries_dir = ["${safeDockerDir}"]`;
  fs.writeFileSync(configFile, configContent, { encoding: 'utf8' });

  // Set XDG environment variables
  process.env.CONTAINERS_CONF = configFile;
  process.env.XDG_CONFIG_HOME = configDir;
  process.env.XDG_DATA_HOME = dataDir;
  process.env.XDG_RUNTIME_DIR = runDir;

  return dockerPath;
}

function getSocketPath() {
  let socketPath;
  if (process.platform === 'win32') {
    socketPath = execSync(
      `"${dockerPath}" machine inspect --format '{{.ConnectionInfo.PodmanPipe.Path}}'`
    )
      .toString()
      .trim();
    return `npipe://${socketPath}`;
  } else if (process.platform === 'darwin') {
    socketPath = execSync(
      `"${dockerPath}" machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}'`
    )
      .toString()
      .trim();
    return `unix://${socketPath}`;
  } else {
    socketPath = execSync(
      `"${dockerPath}" info --format '{{.Host.RemoteSocket.Path}}'`
    )
      .toString()
      .trim();
    return `unix://${socketPath}`;
  }
}

function getDockerVersion() {
  const dockerVersion = execSync(`"${dockerPath}" --version`).toString().trim();
  return dockerVersion;
}

function getDiskUsage() {
  const dataDir = getAppPath();
  let command;
  if (process.platform === 'win32') {
    // Use PowerShell to get the sum of file sizes in bytes
    command = `powershell -Command "(Get-ChildItem -Path '${dataDir}' -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB"`;
  } else {
    command = `du -sm ${dataDir}`;
  }

  const size = execSync(command).toString();
  return parseInt(size);
}

async function startMachine() {
  const win = BrowserWindow.getAllWindows()[0];
  win && win.webContents.send('install-time', '');
  win && win.webContents.send('install-log', 'starting machine...');
  win && win.webContents.send('docker-status', false);

  const startTime = new Date();
  // Send the elapsed time every second
  const timer = setInterval(() => {
    const now = new Date();
    const elapsedTime = Math.round((now - startTime) / 1000); // in seconds
    try {
      win?.webContents?.send('install-time', elapsedTime);
    } catch (err) {
      clearInterval(timer);
    }
  }, 1000);

  // Start machine
  try {
    await new Promise((resolve, reject) => {
      exec(`"${dockerPath}" machine start`, (err, stdout, stderr) => {
        if (err) {
          if (err.message.includes('already running')) {
            win && win.webContents.send('install-log', 'machine is ready!');
            return resolve();
          }
          win && win.webContents.send('install-log', err.message);
          return reject(err);
        }
        win && win.webContents.send('install-log', 'machine is ready!');
        resolve(stdout);
      });
    });
  } catch (err) {
    win && win.webContents.send('install-log', err.message);
  }
  // Get podman socket path
  try {
    process.env.DOCKER_HOST = getSocketPath();
  } catch (err) {
    win && win.webContents.send('install-log', err.message);
  }
  // Get podman version
  try {
    dockerVersion = getDockerVersion();
    const diskUsage = getDiskUsage();
    win &&
      win.webContents.send(
        'docker-status',
        `${dockerVersion} | disk usage: ${(diskUsage / 1024).toFixed(2)}G`
      );
  } catch (err) {
    win && win.webContents.send('install-log', err.message);
  }
  clearInterval(timer);
  win && win.webContents.send('install-time', '');
}

function stopMachine() {
  return new Promise((resolve, reject) => {
    exec(`"${dockerPath}" machine stop`, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

function pruneMachine() {
  const win = BrowserWindow.getAllWindows()[0];
  console.log('pruning machine...');
  win && win.webContents.send('install-log', 'pruning machine...');
  const command = `"${dockerPath}" system prune --all --volumes --force`;
  const proc = spawn(command, { shell: true });
  proc.stdout.on('data', (data) => {
    const log = data.toString();
    win && win.webContents.send('install-log', log);
  });
  proc.stderr.on('data', (data) => {
    const log = data.toString();
    win && win.webContents.send('install-log', log);
  });
}

function resetMachine() {
  const win = BrowserWindow.getAllWindows()[0];
  console.log('resetting machine...');
  win && win.webContents.send('install-log', 'resetting machine...');
  const command = `"${dockerPath}" machine reset --force`;
  const proc = spawn(command, { shell: true });
  proc.stdout.on('data', (data) => {
    const log = data.toString();
    win && win.webContents.send('install-log', log);
  });
  proc.stderr.on('data', (data) => {
    const log = data.toString();
    win && win.webContents.send('install-log', log);
  });
  proc.on('close', () => {
    app.quit();
  });
}

function initMachine() {
  dockerPath = getDockerPath();
  const win = BrowserWindow.getAllWindows()[0];
  const command = `"${dockerPath}" machine init --rootful --memory=4096 --disk-size=20`;
  win && win.webContents.send('install-log', 'init machine...');
  const proc = spawn(command, { shell: true });
  let timer;
  proc.on('spawn', () => {
    let startTime = new Date();
    // Send the elapsed time every second
    timer = setInterval(() => {
      const now = new Date();
      const elapsedTime = Math.round((now - startTime) / 1000); // in seconds
      try {
        win?.webContents?.send('install-time', elapsedTime);
      } catch (err) {
        clearInterval(timer);
      }
    }, 1000);
  });
  proc.stdout.on('data', (data) => {
    const log = data.toString();
    console.log(log);
    win?.webContents?.send('install-log', log);
    if (log.includes('init complete')) {
      clearInterval(timer);
      startMachine();
    }
  });
  proc.stderr.on('data', (data) => {
    const log = data.toString();
    console.log(log);
    win?.webContents?.send('install-log', log);
    if (log.includes('already exists')) {
      clearInterval(timer);
      startMachine();
    }
  });
  proc.on('close', () => {
    clearInterval(timer);
  });
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
    const proc = spawn(dockerPath, args);
    // Start the timer when the process starts
    proc.on('spawn', async () => {
      let startTime = new Date();
      // Send the elapsed time every second
      const timer = setInterval(async () => {
        const now = new Date();
        const elapsedTime = Math.round((now - startTime) / 1000); // in seconds
        const diskUsage = getDiskUsage();

        event.reply('install-time', `${elapsedTime}`);
        args[0] == 'pull' &&
          event.reply(
            'docker-status',
            `${dockerVersion} | disk usage: ${(diskUsage / 1024).toFixed(2)}G`
          );
      }, 1000);

      // Clear the timer when the process exits
      proc.on('close', () => {
        clearInterval(timer);
        event.reply('install-time', '');
      });
    });
    proc.stdout.on('data', (data) => {
      const log = data.toString();
      console.log(`[${logPrefix}] ${log}`);
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
  return new Promise((resolve) => {
    exec(`"${dockerPath}" image inspect ${image}`, (err, stdout, stderr) => {
      resolve(!err);
    });
  });
}

// check if a docker container exists
function dockerContainerExists(name) {
  return new Promise((resolve, reject) => {
    exec(
      `"${dockerPath}" ps -a --filter "name=^/${name}$" --format "{{.Names}}"`,
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
  return new Promise((resolve) => {
    exec(
      `"${dockerPath}" inspect ${name} --format '{{.State.Status}}'`,
      (err, stdout, stderr) => {
        resolve(stdout.trim() == 'running');
      }
    );
  });
}

//clean up the containers
function cleanDockerContainers(dockerImage, action = 'stop') {
  return new Promise((resolve, reject) => {
    // get all containers with the specified image
    exec(
      `"${dockerPath}" ps -aq --filter "ancestor=${dockerImage}"`,
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
              ? `"${dockerPath}" stop ${id}`
              : `"${dockerPath}" rm -f ${id}`;
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
  runDockerCommand,
  dockerImageExists,
  dockerContainerExists,
  dockerContainerIsRunning,
  cleanDockerContainers,
  loadPlatform,
  initMachine,
  stopMachine,
  pruneMachine,
  resetMachine,
  getDockerPath,
  getAppPath,
};
