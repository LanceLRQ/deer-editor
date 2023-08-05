const fs = require('fs');
const path = require('path');
const { ipcMain, dialog } = require('electron')

module.exports = function () {
    // 打开文件对话框
    const openDialog = async (props) => {
        return await dialog.showOpenDialog({
            title: '打开',
            properties: [
                'openDirectory', 'openFile'
            ],
            ...props,
        });
    };
    const getFileExtension = (filename) => {
        const parts = filename.split('.');
        const extension = parts[parts.length - 1];
        return extension.toLowerCase();
    }
    // 获取目录树
    const walkDir = async (dPath, deep = -1) => {
        const travelDirectory = (dirPath, d) => {
            if (deep > -1 && d > deep) return [];
            const files = fs.readdirSync(dirPath);
            return files.map(file => {
                const filePath = path.join(dirPath, file);
                const stats = fs.statSync(filePath);
                const ret = {
                    is_dir: false,
                    name: file,
                    ext: '',
                    path: filePath,
                    size: 0,
                    modify_time: stats.mtime,
                    create_time: stats.ctime,
                    children: [],   // for dir
                }
                if (stats.isFile()) {
                    ret.size = stats.size;
                    ret.ext = getFileExtension(ret.name);
                } else if (stats.isDirectory()) {
                    ret.is_dir = true;
                    ret.children = travelDirectory(filePath, d + 1); // 递归遍历子目录
                }
                return ret;
            });

        }
        return travelDirectory(dPath, 0)
    };
    const isExists = (filePath) => {
        try {
            const exists = fs.existsSync(filePath);
            const stats = fs.statSync(filePath);
            let type = 'unknown';
            if (exists) {
                if (stats.isFile()) {
                    type = 'file';
                } else if (stats.isDirectory()) {
                    type = 'directory';
                } else if (stats.isSymbolicLink()) {
                    type = 'symbolic';
                }
            }
            return { error: false, exists: exists, type: type }
        } catch (err) {
            return { error: err, exists: false, type: 'not found' };
        }
    }
    const RemoveDirOrFiles = (directoryPath) => {
        if (fs.existsSync(directoryPath)) {
            const files = fs.readdirSync(directoryPath);

            files.forEach((file) => {
                const filePath = path.join(directoryPath, file);
                const isDirectory = fs.statSync(filePath).isDirectory();

                if (isDirectory) {
                    RemoveDirOrFiles(filePath); // 递归删除子目录
                } else {
                    fs.unlinkSync(filePath); // 删除文件
                }
            });
            fs.rmdirSync(directoryPath); // 删除空目录
        }
    }
    ipcMain.handle('FileSystem:OpenDialog', (event, props) => {
        return openDialog(props);
    })
    ipcMain.handle('FileSystem:Walk', (event, dirPath, deep) => {
        return walkDir(dirPath, deep);
    })
    ipcMain.handle('FileSystem:Exists', (event, filePath) => {
        return isExists(filePath);
    })
    ipcMain.handle('FileSystem:Delete', (event, filePath) => {
        return RemoveDirOrFiles(filePath);
    })
}