'use strict'

import {app, protocol, BrowserWindow, ipcMain, shell, dialog} from 'electron'
import {createProtocol} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {VUEJS3_DEVTOOLS} from 'electron-devtools-installer'

const path = require('path');
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    {scheme: 'app', privileges: {secure: true, standard: true}}
])

let win;

async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        title: '开发加速器 Development Booster',
        icon: './public/favicon.ico',
        autoHideMenuBar: true,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION

            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: true,
            //出现这个问题是因为官方为了安全性，将 electron v12.0.0 的 contextIsolation 的默认值改了。
            //所以今后要在渲染进程里调用 require 的话，还需要加上 contextIsolation: false 。
            contextIsolation: false,
            enableRemoteModule: true
        },
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }

    // 监听从Vue.js渲染进程发送的事件，例如打开链接请求
    ipcMain.on('open-external-link', (event, url) => {
        shell.openExternal(url); // 使用默认浏览器打开链接
    });


}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            // await installExtension(VUEJS3_DEVTOOLS)
            // VUEJS_DEVTOOLS ---- vue3 用不了
            const {default: installExtension,} = require('electron-devtools-installer')
            // 使用beta版 vue-devtools
            // 参考链接 https://github.com/vuejs/vue-devtools/issues/1279
            // https://v3.vuejs.org/guide/migration/introduction.html#devtools-extension
            // https://chrome.google.com/webstore/detail/vuejs-devtools/ljjemllljcmogpfapbkkighbhhppjdbg
            var vue_devtools_beta = {id: "ljjemllljcmogpfapbkkighbhhppjdbg", electron: ">=1.2.1"}
            var result = await installExtension(vue_devtools_beta)
            if (result) {
                console.log("success load : " + result)
            }
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}


// ipc
ipcMain.handle('get-app-data-path', (event) => {
    return app.getPath('appData');
})

ipcMain.handle('show-message-box', (event, options) => {
    return dialog.showMessageBox(options);
})
