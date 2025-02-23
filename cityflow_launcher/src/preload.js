const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendStart: (data) => ipcRenderer.send('start', data),
  checkDockerInstallation: () => ipcRenderer.send('check-dorkder-installation'),
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  onInstallLog: (callback) => ipcRenderer.on('install-log', callback),
  onDockerStatus: (callback) => ipcRenderer.on('docker-status', callback),
  onUpdateInfo: (callback) => ipcRenderer.on('update-info', callback),
  onNewWindowOpen: (callback) => ipcRenderer.on('new-window-open', callback),
});
