const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    configureWebpack: {
        externals: {
            'electron': 'require("electron")'
        },
        target: 'electron-renderer'
    },
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                nsis: {
                    allowToChangeInstallationDirectory: true,
                    oneClick: false,
                    installerIcon: './public/favicon.ico',  //安装logo
                    installerHeaderIcon: './public/favicon.ico' //安装logo
                },
                win: {
                    icon: './public/favicon.ico'
                },
                mac: {
                    icon: './public/favicon.ico'
                },
                linux: {
                    icon: './public/favicon.ico'
                },
                productName: "开发加速器 Development Booster",
            },
        }
    },
})
