'use strict';
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
const config = require('./config');
const menu = require('./menu');

unhandled();
debug();
contextMenu();

app.setAppUserModelId('com.cainhill.WebcamCircle');

let mainWindow;

const createMainWindow = async () => {
    const win = new BrowserWindow({
        title: app.name,
        show: false,
        maximizable: false,
        minimizable: false,
        acceptFirstMouse: true,
        width: 700,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        },
        frame: false,
        resizable: true,
        alwaysOnTop: true,
        transparent: true
    });

    win.on('ready-to-show', () => {
        win.show();
    });

    win.on('closed', () => {
        mainWindow = undefined;
    });

    await win.loadFile(path.join(__dirname, 'index.html'));

    return win;
};

if (!app.requestSingleInstanceLock()) {
    app.quit();
}

app.on('second-instance', () => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }
        mainWindow.show();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', async () => {
    if (!mainWindow) {
        mainWindow = await createMainWindow();
    }
});

(async () => {
    await app.whenReady();
    Menu.setApplicationMenu(menu);
    mainWindow = await createMainWindow();
})();

// Listen for size change events from renderer process
ipcMain.on('change-size', (event, size) => {
    if (mainWindow) {
        mainWindow.setSize(size, size);
    }
});
