const { app, BrowserWindow} = require('electron');
const path = require('path')
const { URL } = require('url');
const devMode = process.argv[2];
const Store = require('electron-store');

const storeOption={
    name: "config",
    fileExtension: "json",
    cwd: app.getPath('userData'),
    watch: true,
}
const store = new Store(storeOption);
Store.initRenderer();

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1024,
        height: 640,
        webPreferences: {
            webSecurity: false,
            devTools: devMode === 'dev',
            preload: path.join(__dirname, 'preload.js')
        }
    });

    require('./src/electron')(win, store);

    if(devMode === 'dev') {
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
