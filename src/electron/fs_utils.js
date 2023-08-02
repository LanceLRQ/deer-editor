const { ipcMain, dialog } = require('electron')

module.exports = function () {
    // 打开对话框
    const openDialog = async (props) => {
        return await dialog.showOpenDialog({
            title: '打开',
            properties: [
                'openDirectory', 'openFile'
            ],
            ...props,
        });
    };
    ipcMain.handle('FileSystem:OpenDialog', (event, props) => {
        return openDialog(props);
    })
}