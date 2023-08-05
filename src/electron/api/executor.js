const { app, ipcMain} = require('electron');
const path = require('path');
const { spawn } = require('child_process');

module.exports = function () {
    const runDeerExecutorProgram = (args) => new Promise ((resolve, reject) => {
        const compiledProgram = path.join(app.getAppPath(), './bin/deer-executor');
        const childProcess = spawn(compiledProgram, args, {
            stdio: ['inherit', 'pipe', 'pipe'],
        });

        let message = '';

        console.log(`[deer-executor] call: ${args.join(' ')}`);
        childProcess.stdout.on('data', (data) => {
            message += data.toString();
        });

        childProcess.stderr.on('data', (data) => {
            message += data.toString()
        });

        childProcess.on('close', (code) => {
            console.log(`[deer-executor] exit with code ${code}.`);
            if (code !== 0) {
                reject({ code, message });
            } else {
                resolve({ code, message })
            }
        });
    });

    const NewProblemProject = (work_dir, example) => {
        const args = ['package', 'new'];
        if (example) {
            args.push('--sample');
            args.push(example);
        }
        args.push(work_dir);
        return runDeerExecutorProgram(args)
    }


    ipcMain.handle('Shell:DeerExecutor:Run', (event, args) => {
        return runDeerExecutorProgram(args);
    });
    ipcMain.handle('Shell:DeerExecutor:NewProblemProject', (event, work_dir, example) => {
        return NewProblemProject(work_dir, example);
    });
}




