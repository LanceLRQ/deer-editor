const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
})

contextBridge.exposeInMainWorld('DeerUtils', {
    FS: {
        OpenDialog: (props) => ipcRenderer.invoke('FileSystem:OpenDialog', props),
        Walk: (dirPath, deep) => ipcRenderer.invoke('FileSystem:Walk', dirPath, deep),
        Exists: (filePath) => ipcRenderer.invoke('FileSystem:Exists', filePath),
        Delete: (filePath) => ipcRenderer.invoke('FileSystem:Delete', filePath),
    },
    Global: {
        AppPath: () => ipcRenderer.invoke('Global:AppPath'),
        NewProjectWindow: (url, params, hideParent) => ipcRenderer.invoke('Global:NewProjectWindow', url, params, hideParent),
        Setting: {
            Set: (k, v) => ipcRenderer.invoke('Global:Setting:Set', k, v),
            Get: (k) => ipcRenderer.invoke('Global:Setting:Get', k),
            OnDidAnyChange: (cb) => ipcRenderer.on('Global:Setting:OnDidAnyChange', cb),
            RemoveDidAnyChange: (cb) => ipcRenderer.removeListener('Global:Setting:OnDidAnyChange', cb),
        }
    },
    Shell: {
        DeerExecutor: {
            Run: (args) => ipcRenderer.invoke('Shell:DeerExecutor:Run', args),
            NewProblemProject: (args) => ipcRenderer.invoke('Shell:DeerExecutor:NewProblemProject', args),
        }
    }
})

