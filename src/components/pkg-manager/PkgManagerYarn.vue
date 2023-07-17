<script>
import Iconfont from "@/components/Iconfont.vue";
import {
  NInput, NButton, NCard, NSelect, NTooltip,
  NSwitch, NCode, NButtonGroup, NSpin, NPopover,
  NList, NListItem, NThing
} from 'naive-ui'

import 'element-plus/es/components/notification/style/css'
import {ElNotification} from 'element-plus'

const {shell} = require('electron');
const {exec} = require('child_process');

import {h} from 'vue'

import SemverUtil from "@/assets/js/SemverUtil"
import SvgIconLoading from "@/components/svg-icon/SvgIconLoading.vue";

export default {
  name: 'PkgManagerYarn',
  props: {
    data: {
      type: Object,
      required: true,
    }
  },
  components: {
    Notification, // ElementPlus
    Iconfont, SvgIconLoading, // 自定义组件
    NInput, NButton, NCard, NSelect,
    NTooltip, NSwitch, NCode, NButtonGroup,
    NSpin, NPopover, NList, NListItem, NThing, // NaiveUI
  },
  data() {
    return {
      noteChangeable: false,
      pkgData: {
        note: '',
        path: '',
        reloadWhenOpen: false,
      },
      detailData: {
        version: '',
        configurations: {
          registry: '',   // 镜像仓库地址
          cache: '',      // 缓存存放所在文件夹
          yes: false,     // 是否自动确认
          prefix: '',     // 全局安装路径
        }
      },
      detailDataLoading: false,
      // yarn数据是否已经加载
      detailDataLoaded: false,
      // yarn数据是否发生了变化
      detailDataChanged: false,
      // yarn数据是否正在同步
      detailDataSynchronizing: false,
      detailRegistryList: [{
        label: '(官方)https://registry.yarnpkg.com',
        value: 'https://registry.yarnpkg.com',
      }, {
        label: '(阿里云镜像源)https://registry.npmmirror.com',
        value: 'https://registry.npmmirror.com',
      }, {
        label: '(腾讯云镜像源)https://mirrors.cloud.tencent.com/npm/',
        value: 'https://mirrors.cloud.tencent.com/npm/',
      }, {
        label: '(华为云镜像源)https://repo.huaweicloud.com/repository/npm/',
        value: 'https://repo.huaweicloud.com/repository/npm/',
      },],
    }
  },
  methods: {
    // 向父组件发送更新数据的事件
    emitUpdate() {
      this.$emit('update:data', {pkgData: this.pkgData, detailData: this.detailData})
    },

    // 修改备注
    modifyNote() {
      if (!this.noteChangeable) {
        this.noteChangeable = true
      } else {
        // 同步到数据
        this.emitUpdate();
        this.noteChangeable = false
      }
    },
    modifyPath() {
      this.$refs.pkgPathSelector.click();
    },
    // 处理选择的yarn路径
    handlePkgPathSelect(event) {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      this.detailDataLoading = true;

      if (file.name !== "yarn") {
        ElNotification({
          title: '错误',
          message: '请选择yarn文件，而非"yarn.cmd"或其他文件',
          type: 'warning',
        });
        this.detailDataLoading = false;
        return;
      }

      this.verifyYarn(file.path).then((version) => {
        this.pkgData.path = file.path;
        // 如果校验成功，那么
        this.detailData.version = version;
        this.loadPkgDetailData(file.path, version)
      }).catch((error) => {
        ElNotification({
          title: '错误',
          message: error,
          type: 'warning',
        })
      })
    },
    // 通过获取yarn的版本来校验yarn的路径是否正确
    verifyYarn(pkgPath) {
      return new Promise((resolve, reject) => {
        let verified = false;
        exec(pkgPath + ' -v', (error, stdout, stderr) => {
          let version = stdout.trim();   // 应当是SemVer格式的版本号
          // 如果获取失败，或者校验version出不是SemVer格式
          if (error) {
            reject("无效的yarn路径: " + error);
          }
          if (!SemverUtil.isValid(version)) {
            reject('获取的yarn版本号不是有效的SemVer格式：' + version);
          }
          resolve(version);
        });
      })
    },
    // 读取yarn的配置
    loadPkgDetailData(pkgPath, version) {
      if (!pkgPath || pkgPath.length === 0) {
        ElNotification({
          title: '错误',
          message: '无效的yarn路径',
          type: 'warning',
        });
        return;
      }

      let that = this;

      if (!version) {
        this.verifyYarn(pkgPath).then((version) => {
          that.loadPkgDetailData(pkgPath, version)
        }).catch((error) => {
          ElNotification({
            title: '错误',
            message: error,
            type: 'warning',
          })
        })
      }

      const versionParsed = SemverUtil.parse(version);

      switch (versionParsed.major) {
        case "1":
          this.loadPkgDetailDataForVersion1(pkgPath);
          break;
        case "2":
        case "3":
          this.loadPkgDetailDataForVersion2and3(pkgPath);
          break;
        default:
          ElNotification({
            title: '错误',
            message: `当前yarn版本为${version}，目前仅支持的yarn版本: 1.x.x, 2.x.x, 3.x.x`,
            type: 'warning',
          });
          this.detailDataLoading = false;
      }
    },
    loadPkgDetailDataForVersion1(pkgPath) {
      this.detailDataLoading = true;
      this.detailDataLoaded = false;
      const commands = [
        pkgPath + ' config get registry',
      ];

      const commandString = commands.join(' && ');

      new Promise((resolve, reject) => {
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            reject(error);
          }
          let configurations = stdout.split('\n');
          this.detailData.configurations.registry = configurations[0];

          resolve();
        });
      }).then(() => {
        this.detailDataLoading = false;
        this.detailDataLoaded = true;
        this.detailDataChanged = false;
        this.emitUpdate();
      }).catch((error) => {
        ElNotification({
          title: '错误',
          message: error,
          type: 'warning',
        })
        this.detailDataLoading = false;
        this.detailDataChanged = true;
      })
    },
    loadPkgDetailDataForVersion2and3(pkgPath) {
      this.detailDataLoading = true;
      this.detailDataLoaded = false;
      const commands = [
        pkgPath + ' config get npmRegistryServer',
      ];

      const commandString = commands.join(' && ');

      new Promise((resolve, reject) => {
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            reject(error);
          }
          let configurations = stdout.split('\n');
          this.detailData.configurations.registry = configurations[0];

          resolve();
        });
      }).then(() => {
        this.detailDataLoading = false;
        this.detailDataLoaded = true;
        this.detailDataChanged = false;
        this.emitUpdate();
      }).catch((error) => {
        ElNotification({
          title: '错误',
          message: error,
          type: 'warning',
        })
        this.detailDataLoading = false;
        this.detailDataChanged = true;
      })
    },
    // 自定义渲染选择器的选项
    renderPkgRegistryOption({node, option}) {
      return h(NTooltip, {delay: 500}, {
        trigger: () => node,
        default: () => option.label
      })
    },

    // 确认修改yarn配置
    confirmModification() {
      const versionParsed = SemverUtil.parse(this.detailData.version);

      switch (versionParsed.major) {
        case "1":
          this.yarnSyncForVersion1();
          break;
        case "2":
        case "3":
          this.yarnSyncForVersion2and3();
          break;
        default:
          ElNotification({
            title: '错误',
            message: `当前yarn版本为${this.detailData.version}，目前仅支持的yarn版本: 1.x.x, 2.x.x, 3.x.x`,
            type: 'warning',
          });
          this.detailDataLoading = false;
      }
    },
    yarnSyncForVersion1() {
      this.detailDataSynchronizing = true;
      let that = this;
      const commands = [
        this.pkgData.path + ' config set registry ' + this.detailData.configurations.registry,
      ];

      const commandString = commands.join(' && ');
      new Promise((resolve, reject) => {
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            reject(error);
          }
          that.detailDataSynchronizing = false;
          that.detailDataChanged = false;
          that.emitUpdate();
          resolve();
        });
      })
    },
    yarnSyncForVersion2and3() {
      this.detailDataSynchronizing = true;
      let that = this;
      const commands = [
        this.pkgData.path + ' config set npmRegistryServer ' + this.detailData.configurations.registry,
      ];

      const commandString = commands.join(' && ');
      new Promise((resolve, reject) => {
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            reject(error);
          }
          that.detailDataSynchronizing = false;
          that.detailDataChanged = false;
          that.emitUpdate();
          resolve();
        });
      })
    },

  },
  mounted() {
    this.pkgData = JSON.parse(JSON.stringify(this.data.pkgData));
    this.detailData = JSON.parse(JSON.stringify(this.data.detailData));
    if (this.pkgData.path.length > 0) {
      if (!this.pkgData.reloadWhenOpen && this.detailData.version.length > 0) {
        this.detailDataLoaded = true;
      } else if (this.pkgData.reloadWhenOpen) {
        this.loadPkgDetailData(this.pkgData.path);
      }
    }
  },
}
</script>

<template>
  <div id="main">

    <n-card title="基本信息设置">
      <!-- 备注 -->
      <div class="form-item">
        <div class="form-title">备注：</div>
        <div class="form-content">
          <n-input v-model:value="pkgData.note" type="text" placeholder="请输入备注"
                   :disabled="!noteChangeable"/>
        </div>
        <div class="form-extra">
          <n-button @click="modifyNote" style="padding: 4px">
            <Iconfont v-if="!noteChangeable" name="&#xe83a;"></Iconfont>
            <Iconfont v-else name="&#xe841;"></Iconfont>
          </n-button>
        </div>
      </div>
      <!-- yarn路径 -->
      <div class="form-item">
        <div class="form-title">yarn：</div>
        <div class="form-content">
          <n-popover trigger="hover" :delay="500"
                     :disabled="pkgData.path.length === 0">
            <template #trigger>
              <n-input v-model:value="pkgData.path" type="text" placeholder="请选择yarn路径"
                       :disabled="true"/>
            </template>
            <span>{{ pkgData.path }}</span>
          </n-popover>
        </div>
        <div class="form-extra">
          <n-button-group>
            <n-button @click="modifyPath" :loading="detailDataLoading" style="padding: 7px">
              <template #icon>
                <Iconfont name="&#xe83d;"></Iconfont>
              </template>
            </n-button>
            <n-button @click="loadPkgDetailData(pkgData.path, detailData.version)"
                      :disabled="pkgData.path.length === 0"
                      :loading="detailDataLoading || detailDataSynchronizing" style="padding: 7px">
              <template #icon>
                <Iconfont name="&#xe88a;"></Iconfont>
              </template>
            </n-button>
          </n-button-group>
          <input style="display: none" type="file" ref="pkgPathSelector"
                 :multiple="false" @change="handlePkgPathSelect">
        </div>
      </div>
      <!-- 启动时是否重新加载 -->
      <div class="form-item">
        <div class="form-title">自动重载：</div>
        <div class="form-content">
          <n-switch v-model:value="pkgData.reloadWhenOpen" @update:value="emitUpdate">
            <template #checked>
              是的，每次打开该页面都自动加载
            </template>
            <template #unchecked>
              不，使用上一次加载的数据
            </template>
          </n-switch>
        </div>
        <div class="form-extra">
          <n-tooltip trigger="hover">
            <template #trigger>
              <Iconfont class="tip-icon" :size="20" name="&#xe83f;"></Iconfont>
            </template>
            打开该页面时，是否重新加载yarn的数据
          </n-tooltip>
        </div>
      </div>
    </n-card>

    <n-card title="yarn 设置" style="margin-top: 8px">
      <template #header-extra>
        <n-button-group>
          <n-button :disabled="!detailDataChanged || !detailDataLoaded || detailDataLoading || detailDataSynchronizing"
                    :loading="detailDataSynchronizing"
                    @click="confirmModification">
            <template #icon>
              <Iconfont name="&#xe866;"/>
            </template>
            保存
          </n-button>
          <n-button :disabled="pkgData.path.length === 0"
                    :loading="detailDataLoading || detailDataSynchronizing"
                    @click="loadPkgDetailData(pkgData.path, detailData.version)">
            <template #icon>
              <Iconfont name="&#xe88a;"/>
            </template>
            重载
          </n-button>
        </n-button-group>
      </template>
      <div class="mask-outer">
        <div class="mask"
             v-show="detailDataLoading
             || (!detailDataLoaded && (pkgData.reloadWhenOpen || (!pkgData.reloadWhenOpen && !detailData.version)))
             || detailDataSynchronizing">
          <div class="mask-content" v-if="detailDataLoading">
            <svg-icon-loading style="margin-right: 8px"/>
            <span class="mask-text">正在载入数据中...</span>
          </div>
          <div class="mask-content" v-else-if="detailDataSynchronizing">
            <svg-icon-loading style="margin-right: 8px"/>
            <span class="mask-text">正在保存数据中...</span>
          </div>
          <div class="mask-content"
               v-else-if="!detailDataLoaded && (pkgData.reloadWhenOpen || (!pkgData.reloadWhenOpen && !detailData.version))">
            <Iconfont name="&#xe842;" style="margin-right: 8px"/>
            <span class="mask-text">尚未选定yarn，请在基本信息设置中操作</span>
          </div>
        </div>
        <!-- 镜像仓库 -->
        <div class="form-item">
          <div class="form-long-title">镜像仓库：</div>
          <div class="form-content">
            <n-popover trigger="hover" :delay="500" :disabled="detailData.configurations.registry.length === 0">
              <template #trigger>
                <n-select v-model:value="detailData.configurations.registry" filterable
                          @update:value="detailDataChanged = true;"
                          :options="detailRegistryList" :render-option="renderPkgRegistryOption"/>
              </template>
              <span>{{ detailData.configurations.registry }}</span>
            </n-popover>
          </div>
          <div class="form-extra">
            <n-tooltip trigger="hover">
              <template #trigger>
                <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
              </template>
              其他包镜像设置，请见下方"Yarn 高级设置"
            </n-tooltip>
          </div>
        </div>

      </div>
    </n-card>

    <n-card title="yarn 高级设置" style="margin-top: 8px">
      <div class="mask-outer">
        <div class="mask" v-show="pkgData.path.length === 0">
          <div class="mask-content">
            <Iconfont name="&#xe849;" style="margin-right: 8px"/>
            <span class="mask-text">未选择yarn或路径有误</span>
          </div>
        </div>

        <n-list hoverable clickable>
          <!-- Electron镜像设置 -->
          <n-list-item>
            <n-thing class="code-outer">
              <template #header>
                Electron 镜像设置
              </template>
              <template #description>
                使用yarn拉取electron时，需要使用特别的镜像源地址，否则会出现不可预期的错误。
              </template>
              <div class="code-block">
                <n-code :code="pkgData.path + ' config set electron_mirror https://npmmirror.com/mirrors/electron/'"
                        language="bash" word-wrap/>
              </div>
            </n-thing>
          </n-list-item>
          <n-list-item>
            如有其他需要特殊镜像源，或特殊设置，欢迎提issue/pr
          </n-list-item>
        </n-list>

      </div>
    </n-card>

  </div>
</template>

<style scoped>
#main {
  padding: 8px;
}

.form-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.form-title {
  min-width: 60px;
  text-align: right;
}

.form-long-title {
  min-width: 100px;
  text-align: right;
}

.form-content {
  max-width: 300px;
  flex: 1;
}

.form-extra {
  margin-left: 8px;
}

.tip-icon {
  cursor: pointer;
  margin-left: 8px;
}

.mask-outer {
  position: relative;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, .8);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mask-content {
  display: flex;
  align-items: center;
}

.mask-text {
  font-weight: bold;
  font-size: 16px;
}

.code-outer:hover .code-block {
  background-color: #ffffff;
}

.code-block {
  transition: background-color .3s;
  background-color: #F6F6F6;
  padding: 12px;
  border-radius: 8px;
}
</style>