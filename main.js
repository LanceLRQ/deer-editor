const { app, BrowserWindow, ipcMain} = require('electron');
const path = require('path')
const { URL } = require('url');
const devMode = process.argv[2] || '';
const Store = require('electron-store');

const storeOption={
    name: "config",
    fileExtension: "json",
    cwd: app.getPath('userData'),
    watch: true,
}
const store = new Store(storeOption);
Store.initRenderer();

let unscribStore = null

const defaultChildWindowParams = {
    width: 1280,
    height: 720,
}

const gotoAppUrl = (win, url) => {
    if(devMode === 'dev') {
        win.loadURL( "http://localhost:3000/#" + url)
    } else {
        win.loadFile(path.join(__dirname, './build/index.html'), {
            hash: url,
        })
    }
}

const createChildWindow = (mainWindow, url, params, hideParent) => {
    const childWindow = new BrowserWindow({
        ...defaultChildWindowParams,
        ...params,
        parent: hideParent ? null : mainWindow,
        webPreferences: {
            webSecurity: false,
            devTools: devMode === 'dev',
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const unscribStore = store.onDidAnyChange((nv, ov) => {
        childWindow.webContents.send('Global:Setting:OnDidAnyChange', nv, ov);
    })
    childWindow.on('close', () => {
        unscribStore && unscribStore();
    });
    childWindow.on('closed', () => {
        if (hideParent) {
            createMainWindow();
        }
    });

    // 加载子窗口的 HTML 页面
    gotoAppUrl(childWindow, url);

    if (hideParent) {
        mainWindow.close(); // 隐藏主窗口
    }
}

const createMainWindow = () => {
    const win = new BrowserWindow({
        width: 1024,
        height: 640,
        webPreferences: {
            webSecurity: false,
            devTools: devMode === 'dev',
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const unscribStore = store.onDidAnyChange((nv, ov) => {
        win.webContents.send('Global:Setting:OnDidAnyChange', nv, ov);
    })
    win.on('closed', () => {
        ipcMain.removeHandler('Global:NewProjectWindow');
        unscribStore && unscribStore();
    });

    ipcMain.handle('Global:NewProjectWindow', (event, url, params, hideParent) => {
        return createChildWindow(win, url, params || {}, !!hideParent);
    })

    gotoAppUrl(win, '');

};

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
    app.quit();
    // }
})

app.whenReady().then(() => {
    require('./src/electron/api')(store);
    createMainWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
})
