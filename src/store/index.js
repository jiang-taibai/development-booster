import {createStore} from 'vuex'

const fs = require('fs')
const path = require('path')

// 包管理器列表的数据文件路径
const PACKAGE_MANAGER_LIST_DATA_PATH = './data/package-manager-list-data.json';

export default createStore({
    state: {
        pkgManagerList: [],
    },
    getters: {},
    mutations: {
        setPkgManagerList(state, pkgManagerList) {
            state.pkgManagerList = pkgManagerList;
        },
    },
    actions: {
        saveDataToLocalFile({state}) {
            if (!fs.existsSync(path.dirname(PACKAGE_MANAGER_LIST_DATA_PATH))) {
                fs.mkdirSync(path.dirname(PACKAGE_MANAGER_LIST_DATA_PATH));
            }
            fs.writeFileSync(PACKAGE_MANAGER_LIST_DATA_PATH, JSON.stringify(state, null, 2));
        },
        loadDataFromLocalFile({commit}) {
            if (!fs.existsSync(path.dirname(PACKAGE_MANAGER_LIST_DATA_PATH))) {
                fs.mkdirSync(path.dirname(PACKAGE_MANAGER_LIST_DATA_PATH));
            }
            if (fs.existsSync(PACKAGE_MANAGER_LIST_DATA_PATH)) {
                const data = fs.readFileSync(PACKAGE_MANAGER_LIST_DATA_PATH, 'utf-8');
                commit('setPkgManagerList', JSON.parse(data).pkgManagerList);
            }
        },
    },
    modules: {}
})
