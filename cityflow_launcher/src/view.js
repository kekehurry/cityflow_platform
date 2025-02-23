const { BrowserView } = require('electron');

class ViewManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.views = new Map();
    this.activeViewId = null;
    this.titleBarHeight = 30;
  }

  createView(id, url) {
    const view = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    // Handle new window events within the view
    view.webContents.setWindowOpenHandler(({ url, disposition }) => {
      console.log(disposition, url);
      this.mainWindow.webContents.send('new-window-open', url);
      return { action: 'deny' };
    });
    view.setAutoResize({ width: true, height: true });

    this.mainWindow.addBrowserView(view);
    this.updateViewBounds(view);
    view.webContents.loadURL(url);
    this.views.set(id, view);
    return view;
  }

  updateViewBounds(view) {
    const bounds = this.mainWindow.getBounds();
    view.setBounds({
      x: 0,
      y: this.titleBarHeight,
      width: bounds.width,
      height: bounds.height - this.titleBarHeight,
    });
  }

  switchView(id) {
    if (this.activeViewId && this.views.has(this.activeViewId)) {
      const currentView = this.views.get(this.activeViewId);
      this.mainWindow.removeBrowserView(currentView);
    }

    if (this.views.has(id)) {
      const newView = this.views.get(id);
      this.mainWindow.addBrowserView(newView);
      this.updateViewBounds(newView);
      this.activeViewId = id;
    }
  }

  removeView(id) {
    if (this.views.has(id)) {
      const view = this.views.get(id);
      view.webContents.setWindowOpenHandler(null);
      this.mainWindow.removeBrowserView(view);
      view.webContents.destroy();
      this.views.delete(id);

      // If no views remain, load the initial page
      if (this.views.size === 0) {
        const path = require('path');
        this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
      }
    }
  }
}

module.exports = ViewManager;
