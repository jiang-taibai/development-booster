import {createStore} from 'vuex'

const fs = require('fs')
const path = require('path')

// Import the electron module
const {ipcRenderer, dialog} = require('electron')


// 包管理器列表的数据文件路径
const DATA_PATH = './development-booster/User Data/vuex-data.json';
let appDataPathBackups = void 0;

// Function to get the APPDATA path
function getAppDataPath() {
    return new Promise((resolve, reject) => {
        if (appDataPathBackups) {
            resolve(appDataPathBackups);
        } else {
            ipcRenderer.invoke('get-app-data-path')
                .then((path) => {
                    appDataPathBackups = path;
                    if (!path) reject('无法找到APPDATA路径，请联系开发者解决BUG')
                    resolve(path)
                })
                .catch((error) => {
                    console.log(error)
                    reject('无法找到APPDATA路径：' + error)
                })
        }
    })
}

export default createStore({
    state: {
        pkgManagerList: [],
    },
    getters: {},
    mutations: {
        setPkgManagerList(state, pkgManagerList) {
            // 这样写是为了保持响应式
            state.pkgManagerList.splice(0, state.pkgManagerList.length, ...pkgManagerList);
        },
    },
    actions: {
        saveDataToLocalFile({state}) {
            getAppDataPath()
                .then((appDataPath) => {
                    let PkgManagerListDataPath = path.join(appDataPath, DATA_PATH);
                    if (!fs.existsSync(path.dirname(PkgManagerListDataPath))) {
                        fs.mkdirSync(path.dirname(PkgManagerListDataPath));
                    }
                    fs.writeFileSync(PkgManagerListDataPath, JSON.stringify(state, null, 2));
                })
                .catch((error) => {
                    ipcRenderer.invoke('show-message-box', {
                        type: 'error',
                        title: '错误',
                        message: error,
                    }).then((result) => {
                    })
                });
        },
        loadDataFromLocalFile({commit}) {
            getAppDataPath()
                .then((appDataPath) => {
                    let PkgManagerListDataPath = path.join(appDataPath, DATA_PATH);
                    if (!fs.existsSync(path.dirname(PkgManagerListDataPath))) {
                        fs.mkdirSync(path.dirname(PkgManagerListDataPath));
                    }
                    if (fs.existsSync(PkgManagerListDataPath)) {
                        const data = fs.readFileSync(PkgManagerListDataPath, 'utf-8');
                        commit('setPkgManagerList', JSON.parse(data).pkgManagerList);
                    }
                })
                .catch((error) => {
                    ipcRenderer.invoke('show-message-box', {
                        type: 'error',
                        title: '错误',
                        message: error,
                    }).then((result) => {
                    })
                })
        },
    },
    modules: {}
})
