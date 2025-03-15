const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  sendStart: (data) => ipcRenderer.send('start', data),
  closeWindow: () => ipcRenderer.send('close-window'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  onInstallLog: (callback) => ipcRenderer.on('install-log', callback),
  onInstallTime: (callback) => ipcRenderer.on('install-time', callback),
  onDockerStatus: (callback) => ipcRenderer.on('docker-status', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onNewWindow: (callback) => {
    ipcRenderer.on('new-window-open', (_, data) => callback(data));
  },
});
