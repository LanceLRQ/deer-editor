const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
})

contextBridge.exposeInMainWorld('DeerUtils', {
    FS: {
        OpenDialog: (props) => ipcRenderer.invoke('FileSystem:OpenDialog', props)
    },
    Global: {
        Setting: {
            Set: (k, v) => ipcRenderer.invoke('Global:Setting:Set', k, v),
            Get: (k) => ipcRenderer.invoke('Global:Setting:Get', k),
            OnDidAnyChange: (cb) => ipcRenderer.on('Global:Setting:OnDidAnyChange', cb),
            RemoveDidAnyChange: (cb) => ipcRenderer.removeListener('Global:Setting:OnDidAnyChange', cb),
        }
    }
})

