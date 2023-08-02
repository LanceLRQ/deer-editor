const { ipcMain } = require('electron')
module.exports = function (mainWindow, store) {

    const StoreSet = (event, key, val) => {
        return store.set(key, val)
    }

    const StoreGet = (event, key) => {
        return store.get(key)
    }


    ipcMain.handle('Global:Setting:Set', StoreSet)
    ipcMain.handle('Global:Setting:Get', StoreGet)

    store.onDidAnyChange((nv, ov) => {
        mainWindow.webContents.send('Global:Setting:OnDidAnyChange', nv, ov);
    })
}