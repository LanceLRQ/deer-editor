const { app, BrowserWindow } = require('electron');
const path = require('path')
const { URL } = require('url');
const mode = process.argv[2];

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1024,
        height: 640,
        webPreferences: {
            devTools: mode === 'dev'
        }
    });

    if(mode === 'dev') {
        win.loadURL("http://localhost:3000/")
    } else {
        win.loadURL(new URL('file://' + path.join(__dirname, './build/index.html')))
    }
};

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
