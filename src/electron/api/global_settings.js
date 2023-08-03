const { ipcMain } = require('electron')
module.exports = function (store) {

    const StoreSet = (event, key, val) => {
        return store.set(key, val)
    }

    const StoreGet = (event, key) => {
        return store.get(key)
    }

    ipcMain.handle('Global:Setting:Set', StoreSet)
    ipcMain.handle('Global:Setting:Get', StoreGet)
}