const { app } = require('electron');

const isMac = process.platform === 'darwin';

const template = [
  // macOS 专属应用菜单
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

  // 编辑菜单（跨平台）
  {
    label: 'Edit',
    submenu: [
      { role: 'undo', accelerator: isMac ? 'Cmd+Z' : 'Ctrl+Z' },
      { role: 'redo', accelerator: isMac ? 'Shift+Cmd+Z' : 'Ctrl+Y' },
      { type: 'separator' },
      { role: 'cut', accelerator: isMac ? 'Cmd+X' : 'Ctrl+X' },
      { role: 'copy', accelerator: isMac ? 'Cmd+C' : 'Ctrl+C' },
      { role: 'paste', accelerator: isMac ? 'Cmd+V' : 'Ctrl+V' },
      ...(isMac
        ? [
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll', accelerator: 'Cmd+A' },
            { type: 'separator' },
            {
              label: 'Speech',
              submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
            },
          ]
        : [
            { role: 'delete', accelerator: 'Del' },
            { type: 'separator' },
            { role: 'selectAll', accelerator: 'Ctrl+A' },
          ]),
    ],
  },

  // 视图菜单（跨平台）
  {
    label: 'View',
    submenu: [
      { role: 'reload', accelerator: isMac ? 'Cmd+R' : 'Ctrl+R' },
      {
        role: 'forceReload',
        accelerator: isMac ? 'Shift+Cmd+R' : 'Ctrl+Shift+R',
      },
      {
        role: 'toggleDevTools',
        accelerator: isMac ? 'Cmd+Option+I' : 'Ctrl+Shift+I',
      },
      {
        label: 'Inspect Element',
        accelerator: isMac ? 'Cmd+Shift+C' : 'Ctrl+Shift+C',
        click: (menuItem, browserWindow) => {
          if (browserWindow) {
            browserWindow.webContents.inspectElement(0, 0);
          }
        },
      },
      { type: 'separator' },
      { role: 'resetZoom', accelerator: isMac ? 'Cmd+0' : 'Ctrl+0' },
      { role: 'zoomIn', accelerator: isMac ? 'Cmd+Plus' : 'Ctrl+Plus' },
      { role: 'zoomOut', accelerator: isMac ? 'Cmd+-' : 'Ctrl+-' },
      { type: 'separator' },
      { role: 'togglefullscreen', accelerator: isMac ? 'Ctrl+Cmd+F' : 'F11' },
    ],
  },

  // 窗口菜单（跨平台）
  {
    label: 'Window',
    submenu: [
      { role: 'minimize', accelerator: isMac ? 'Cmd+M' : 'Ctrl+M' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' },
          ]
        : [{ role: 'close', accelerator: 'Ctrl+W' }]),
    ],
  },
];

module.exports = template;
