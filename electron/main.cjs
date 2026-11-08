
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 900,
        minHeight: 600,
        title: 'MuseumX',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    win.webContents.setWindowOpenHandler((details) => {
        const url = details.url;

        if (url.startsWith('https://')) {
            shell.openExternal(url);
        }

        return { action: 'deny' };
    });

    win.webContents.on('will-navigate', (event) => {
        event.preventDefault();
    });

    const isProduction = app.isPackaged || process.env.MUSEUMX_PROD === '1';

    if (isProduction) {
        const filePath = path.join(__dirname, '..', 'client', 'dist', 'index.html');
        win.loadFile(filePath);
    } else {
        win.loadURL('http://localhost:5173');
    }
}

ipcMain.handle('app:getInfo', () => {
    return {
        version: app.getVersion(),
        platform: process.platform
    };
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        const openWindows = BrowserWindow.getAllWindows();

        if (openWindows.length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
