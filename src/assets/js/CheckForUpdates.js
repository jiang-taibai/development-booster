const axios = require('axios');

const CurrentVersion = 'v1.0.1';

// 仓库的用户名和仓库名
const username = 'Jiang-TaiBai';
const repo = 'development-booster';

// GitHub/Gitee API 地址
// const apiUrl = `https://api.github.com/repos/${username}/${repo}/releases/latest`;
const apiUrl = `https://gitee.com/api/v5/repos/${username}/${repo}/releases/latest`;

// 发起 API 请求，获取最新版本信息
const getLatestState = () => {
    return new Promise((resolve, reject) => {
        // axios
        //     .get(apiUrl)
        //     .then((response) => {
        //         console.log(response)
        //         resolve(response.data);
        //     })
        //     .catch((error) => {
        //         console.error('Error:', error.message);
        //         reject(error);
        //     });
        resolve(versionData_CJAXICAXNCIUNSZXCKAWSD);
    })

}

export const CheckForUpdates = (onExistNewVersion, onNotExistNewVersion, onError) => {
    getLatestState()
        .then((data) => {
            let result = {
                currentVersion: CurrentVersion,
                latestVersion: data.tag_name,
                releaseNotes: data.body,
                assets: data.assets,
            }
            if (data.tag_name === CurrentVersion) {
                onNotExistNewVersion(result);
            } else {
                onExistNewVersion(result);
            }
        })
        .catch((error) => {
            console.error('Error:', error.message);
            onError(error);
        });
}

// 由于 GitHub API 限制，无法多次获取最新版本信息，所以使用本地数据进行开发时测试
let versionData_CJAXICAXNCIUNSZXCKAWSD = {
    "id": 321081,
    "tag_name": "v1.0.1",
    "target_commitish": "768669fc6f894a05851b9c8653fa7d400b6db9c2",
    "prerelease": false,
    "name": "开发加速器 v1.0.0",
    "body": "基本信息：\r\n\r\n- 版本号：v1.0.0\r\n- 更新时间：2023年07月17日 20:52:31\r\n\r\n更新说明：\r\n\r\n- 实现对npm、yarn、pnpm、pip的镜像管理以及附加功能\r\n\r\n文件说明：\r\n\r\n- development-booster-setup-v1.0.0.exe：可安装程序\r\n- development-booster-v1.0.0.zip：免安装程序\r\n- Source code：为所有源文件，包括文档、数据资源、配置资源等\r\n",
    "author": {
        "id": 9596270,
        "login": "jiang-taibai",
        "name": "江太白",
        "avatar_url": "https://foruda.gitee.com/avatar/1680433647548991094/9596270_jiang-taibai_1680433647.png",
        "url": "https://gitee.com/api/v5/users/jiang-taibai",
        "html_url": "https://gitee.com/jiang-taibai",
        "remark": "",
        "followers_url": "https://gitee.com/api/v5/users/jiang-taibai/followers",
        "following_url": "https://gitee.com/api/v5/users/jiang-taibai/following_url{/other_user}",
        "gists_url": "https://gitee.com/api/v5/users/jiang-taibai/gists{/gist_id}",
        "starred_url": "https://gitee.com/api/v5/users/jiang-taibai/starred{/owner}{/repo}",
        "subscriptions_url": "https://gitee.com/api/v5/users/jiang-taibai/subscriptions",
        "organizations_url": "https://gitee.com/api/v5/users/jiang-taibai/orgs",
        "repos_url": "https://gitee.com/api/v5/users/jiang-taibai/repos",
        "events_url": "https://gitee.com/api/v5/users/jiang-taibai/events{/privacy}",
        "received_events_url": "https://gitee.com/api/v5/users/jiang-taibai/received_events",
        "type": "User"
    },
    "created_at": "2023-07-17T21:22:28+08:00",
    "assets": [{
        "browser_download_url": "https://gitee.com/jiang-taibai/development-booster/releases/download/v1.0.0/development-booster-setup-v1.0.0.exe",
        "name": "development-booster-setup-v1.0.0.exe"
    }, {
        "browser_download_url": "https://gitee.com/jiang-taibai/development-booster/releases/download/v1.0.0/development-booster-v1.0.0.zip",
        "name": "development-booster-v1.0.0.zip"
    }, {"browser_download_url": "https://gitee.com/jiang-taibai/development-booster/archive/refs/tags/v1.0.0.zip"}]
}


