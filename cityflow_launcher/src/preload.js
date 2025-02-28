const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  sendStart: (data) => ipcRenderer.send('start', data),
  checkDockerInstallation: () => ipcRenderer.send('check-dorkder-installation'),
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  onInstallLog: (callback) => ipcRenderer.on('install-log', callback),
  onInstallTime: (callback) => ipcRenderer.on('install-time', callback),
  onDockerStatus: (callback) => ipcRenderer.on('docker-status', callback),
  onUpdateInfo: (callback) => ipcRenderer.on('update-info', callback),
  onNewWindow: (callback) => {
    ipcRenderer.on('new-window-open', (_, data) => callback(data));
  },
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', () => {
      callback;
    });
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', () => {
      callback();
      ipcRenderer.removeAllListeners('update-downloaded');
    });
  },
  restartApp: () => {
    ipcRenderer.send('restart_app');
  },
});
