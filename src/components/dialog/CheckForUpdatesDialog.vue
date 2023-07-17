<script>
import {defineComponent} from 'vue'
import {NButton, NScrollbar, NUpload} from "naive-ui";
import 'element-plus/es/components/dialog/style/css'
import {ElDialog} from "element-plus";
import {CheckForUpdates} from "@/assets/js/CheckForUpdates";

import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs 核心代码
import hljs from 'highlight.js/lib/core';
import {IdGenerate} from "@/assets/js/Utils";
// 按需引入语言包
// import json from 'highlight.js/lib/languages/json';
// hljs.registerLanguage('json', json);

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

const {ipcRenderer} = window.require('electron');

export default defineComponent({
  name: "CheckForUpdatesDialog",
  components: {
    NScrollbar, NButton, NUpload,
    ElDialog,
    VMdPreview,
  },
  data() {
    return {
      showUpdateModel: false,
      showCheckUpdateFailModel: true,

      currentVersion: void 0,
      latestVersion: void 0,
      releaseNotes: void 0,
      assets: [],
      fileExample: {
        id: 'c',
        name: '现在就可下载哟.png',
        status: 'finished',
        url: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
      }
    }
  },
  mounted() {
    CheckForUpdates(({currentVersion, latestVersion, releaseNotes, assets}) => {
      this.currentVersion = currentVersion;
      this.latestVersion = latestVersion;
      this.releaseNotes = releaseNotes;
      this.assets = []
      for (const asset of assets) {
        if (!asset.name) {
          continue;
        }
        this.assets.push({
          id: IdGenerate(),
          name: asset.name,
          status: 'finished',
          url: asset.browser_download_url
        });
      }
      this.showUpdateModel = true;
    }, ({currentVersion, latestVersion, releaseNotes, assets}) => {

    }, (error) => {
      this.showCheckUpdateFailModel = true;
    });
  },
  methods: {
    close() {
      this.showUpdateModel = false;
      this.showCheckUpdateFailModel = false;
    },
    confirmUpdate() {
      this.close();
    },
    cancelUpdate() {
      this.close();
    },
    openGitee() {
      ipcRenderer.send('open-external-link', "https://gitee.com/jiang-taibai/development-booster/releases/latest");
      this.close();
    },
    openGithub() {
      ipcRenderer.send('open-external-link', "https://github.com/Jiang-TaiBai/development-booster/releases/latest");
      this.close();
    },
  }
})
</script>

<template>
  <div>
    <el-dialog v-model="showUpdateModel" top="8vh" class="custom-dialog-class-for-check-for-updates-dialog"
               :title="'检测到新版本🚀🚀🚀' + latestVersion">
      <div>
        <n-scrollbar style="max-height: 60vh;">
          <div>
            <n-upload :disabled="true" class="custom-n-upload-class-for-check-for-updates-dialog"
                      :show-download-button="true"
                      :show-trigger="false"
                      :file-list="assets"/>
            <v-md-preview :text="releaseNotes"/>
          </div>
        </n-scrollbar>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <n-button @click="cancelUpdate">取消</n-button>
          <n-button @click="confirmUpdate">确定</n-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog v-model="showCheckUpdateFailModel" title="检查更新失败">
      <div>检查更新程序似乎出现了问题？请检查网络连接或前往项目页面查看。</div>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 8px">
          <n-button @click="openGitee">去Gitee看看</n-button>
          <n-button @click="openGithub">去Github看看</n-button>
          <n-button @click="close">不看</n-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style>
/* 由于是全局样式，故需要把名字弄长一点，以防冲突 */
.custom-dialog-class-for-check-for-updates-dialog .el-dialog__body {
  padding: 0 8px;
}

.custom-n-upload-class-for-check-for-updates-dialog a {
  pointer-events: none;
  cursor: default;
}
</style>