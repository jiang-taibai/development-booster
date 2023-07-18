<script>
import Iconfont from "@/components/Iconfont.vue";
import {
  NButton,
  NButtonGroup,
  NCard,
  NCode,
  NInput,
  NList,
  NListItem,
  NPopover,
  NSelect,
  NSpin,
  NSwitch,
  NThing,
  NTooltip
} from 'naive-ui'

import 'element-plus/es/components/notification/style/css'
import {ElNotification} from 'element-plus'
import {h} from 'vue'

import SemverUtil from "@/assets/js/SemverUtil"
import SvgIconLoading from "@/components/svg-icon/SvgIconLoading.vue";

const {shell, remote} = require('electron');
const {exec} = require('child_process');

import {NpmRegistries} from "@/assets/registry/npm";

export default {
  name: 'PkgManagerNpm',
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
      // NPM数据是否已经加载
      detailDataLoaded: false,
      // NPM数据是否发生了变化
      detailDataChanged: false,
      // NPM数据是否正在同步
      detailDataSynchronizing: false,
      detailRegistryList: NpmRegistries,
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
      this.$refs.npmPathSelector.click();
    },
    // 处理选择的npm.cmd路径
    handleNpmPathSelect(event) {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      this.detailDataLoading = true;

      if (file.name !== "npm") {
        ElNotification({
          title: '错误',
          message: '请选择npm文件',
          type: 'warning',
        });
        this.detailDataLoading = false;
        return;
      }

      this.verifyNpm(file.path).then((version) => {
        this.pkgData.path = file.path;
        // 如果校验成功，那么
        this.loadNpmData(file.path)
      }).catch((error) => {
        ElNotification({
          title: '错误',
          message: error,
          type: 'warning',
        })
      })

    },
    // 通过获取npm的版本来校验npm的路径是否正确
    verifyNpm(npmPath) {
      return new Promise((resolve, reject) => {
        let verified = false;
        exec(npmPath + ' -v', (error, stdout, stderr) => {
          let version = stdout.trim();   // 应当是SemVer格式的版本号
          // 如果获取失败，或者校验version出不是SemVer格式
          if (error) {
            reject("无效的npm路径: " + error);
          }
          if (!SemverUtil.isValid(version)) {
            reject('获取的npm版本号不是有效的SemVer格式：' + version);
          }
          resolve(version);
        });
      })
    },
    // 读取npm的配置
    loadNpmData(npmPath) {
      if (!npmPath || npmPath.length === 0) {
        ElNotification({
          title: '错误',
          message: '无效的npm路径',
          type: 'warning',
        });
        return;
      }
      this.detailDataLoading = true;
      this.detailDataLoaded = false;
      const commands = [
        npmPath + ' config get cache',
        npmPath + ' config get registry',
        npmPath + ' config get yes',
        npmPath + ' -v',
      ];

      const commandString = commands.join(' && ');

      new Promise((resolve, reject) => {
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            reject(error);
          }
          let configurations = stdout.split('\n');
          this.detailData.configurations.cache = configurations[0];
          this.detailData.configurations.registry = configurations[1];
          this.detailData.configurations.yes = configurations[2] === "true";    // 类型为空值或者布尔值
          this.detailData.version = configurations[3];

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
        // this.detailDataLoaded = true;
      })
    },
    // 自定义渲染选择器的选项
    renderNpmRegistryOption({node, option}) {
      return h(NTooltip, {delay: 500}, {
        trigger: () => node,
        default: () => option.label
      })
    },

    // 以下为npm的配置修改
    modifyPrefix() {
      this.$refs.npmPrefixSelector.click();
    },
    handlePrefixSelect(event) {
      const selectedFiles = event.target.files;
      if (selectedFiles.length === 1 && selectedFiles[0].webkitRelativePath === '') {
        // 用户选择了一个文件夹
        const folderPath = selectedFiles[0].path;
        this.detailData.configurations.prefix = folderPath;

        this.detailDataChanged = true;
      } else {
        // 不做处理
      }
    },
    modifyCache() {
      remote.dialog.showOpenDialog({
        properties: ['openDirectory'],
        defaultPath: this.detailData.configurations.cache ? this.detailData.configurations.cache : '',
      }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
          this.detailData.configurations.cache = result.filePaths[0];
          this.detailDataChanged = true;
        }
      }).catch(err => {
        console.error('打开文件夹选择窗口时出错:', err);
      });
    },
    // 确认修改npm配置
    confirmModification() {
      this.detailDataSynchronizing = true;
      let that = this;
      const commands = [
        this.pkgData.path + ' config set cache ' + this.detailData.configurations.cache,
        this.pkgData.path + ' config set registry ' + this.detailData.configurations.registry,
        this.pkgData.path + ' config set yes ' + this.detailData.configurations.yes,
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
        this.loadNpmData(this.pkgData.path);
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
      <!-- npm路径 -->
      <div class="form-item">
        <div class="form-title">npm：</div>
        <div class="form-content">
          <n-popover trigger="hover" :delay="500"
                     :disabled="pkgData.path.length === 0">
            <template #trigger>
              <n-input v-model:value="pkgData.path" type="text" placeholder="请选择npm文件路径"
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
            <n-button @click="loadNpmData(pkgData.path)" :disabled="pkgData.path.length === 0"
                      :loading="detailDataLoading || detailDataSynchronizing" style="padding: 7px">
              <template #icon>
                <Iconfont name="&#xe88a;"></Iconfont>
              </template>
            </n-button>
          </n-button-group>
          <input style="display: none" type="file" ref="npmPathSelector"
                 :multiple="false" @change="handleNpmPathSelect">
        </div>
      </div>
      <!-- 启动时是否重新加载 -->
      <div class="form-item">
        <div class="form-title">自动重载：</div>
        <div class="form-content">
          <div style="display: flex; align-items: center; gap: 8px; color: #666666">
            <n-switch v-model:value="pkgData.reloadWhenOpen" @update:value="emitUpdate"/>
            <span v-if="pkgData.reloadWhenOpen">是的，每次打开该页面都自动加载</span>
            <span v-else>不，使用上一次加载的数据</span>
          </div>
        </div>
        <div class="form-extra">
          <n-tooltip trigger="hover">
            <template #trigger>
              <Iconfont class="tip-icon" :size="20" name="&#xe83f;"></Iconfont>
            </template>
            打开该页面时，是否重新加载npm的数据
          </n-tooltip>
        </div>
      </div>
    </n-card>

    <n-card title="npm 设置" style="margin-top: 8px">
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
                    @click="loadNpmData(pkgData.path)">
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
            <span class="mask-text">尚未选定npm，请在基本信息设置中操作</span>
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
                          :options="detailRegistryList" :render-option="renderNpmRegistryOption"/>
              </template>
              <span>{{ detailData.configurations.registry }}</span>
            </n-popover>
          </div>
          <div class="form-extra">
            <n-tooltip trigger="hover">
              <template #trigger>
                <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
              </template>
              其他包镜像设置，请见下方"npm 高级设置"
            </n-tooltip>
          </div>
        </div>

        <!-- 全局包地址
        <div class="form-item">
          <div class="form-long-title">全局包地址：</div>
          <div class="form-content">
            <n-popover trigger="hover" :delay="500" :disabled="detailData.configurations.prefix.length === 0">
              <template #trigger>
                <n-input v-model:value="detailData.configurations.prefix" type="text"
                         placeholder="请选择全局下载的包默认保存地址"
                         :disabled="true"/>
              </template>
              <span>{{ detailData.configurations.prefix }}</span>
            </n-popover>
          </div>
          <div class="form-extra">
            <n-button @click="modifyPrefix" style="padding: 4px">
              <Iconfont name="&#xe856;"/>
            </n-button>
            <input type="file" ref="npmPrefixSelector" :multiple="false"
                   @change="handlePrefixSelect" webkitdirectory directory style="display: none;">
            <n-tooltip trigger="hover">
              <template #trigger>
                <Iconfont class="tip-icon" :size="20" name="&#xe83f;"></Iconfont>
              </template>
              当执行
              <n-code code="npm install xxx -g" language="bash" inline/>
              时，会将包下载到该目录下
            </n-tooltip>
          </div>
        </div>
        -->

        <!-- 缓存地址 -->
        <div class="form-item">
          <div class="form-long-title">缓存地址：</div>
          <div class="form-content">
            <n-popover trigger="hover" :delay="500" :disabled="detailData.configurations.cache.length === 0">
              <template #trigger>
                <n-input v-model:value="detailData.configurations.cache" type="text"
                         placeholder="请选择npm缓存文件保存地址"
                         :disabled="true"/>
              </template>
              <span>{{ detailData.configurations.cache }}</span>
            </n-popover>
          </div>
          <div class="form-extra">
            <n-button @click="modifyCache" style="padding: 4px">
              <Iconfont name="&#xe856;"/>
            </n-button>
            <n-tooltip trigger="hover">
              <template #trigger>
                <Iconfont class="tip-icon" :size="20" name="&#xe83f;"></Iconfont>
              </template>
              npm 的缓存目录的位置。
            </n-tooltip>
          </div>
        </div>
        <!-- 默认同意 -->
        <div class="form-item">
          <div class="form-long-title">默认同意：</div>
          <div class="form-content">
            <div style="display: flex; align-items: center; gap: 8px; color: #666666">
              <n-switch v-model:value="detailData.configurations.yes"
                        @update:value="detailDataChanged = true"/>
              <span v-if="detailData.configurations.yes">是的，每次安装默认同意</span>
              <span v-else>不，每次安装都需要我手动同意</span>
            </div>
          </div>
          <div class="form-extra">
            <n-tooltip trigger="hover">
              <template #trigger>
                <Iconfont class="tip-icon" :size="20" name="&#xe83f;"></Iconfont>
              </template>
              对 npm 可能在命令行上打印的任何提示自动回答 "yes"。
            </n-tooltip>
          </div>
        </div>
      </div>
    </n-card>

    <n-card title="npm 高级设置" style="margin-top: 8px">
      <div class="mask-outer">
        <div class="mask" v-show="pkgData.path.length === 0">
          <div class="mask-content">
            <Iconfont name="&#xe849;" style="margin-right: 8px"/>
            <span class="mask-text">未选择npm.cmd或路径有误</span>
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
                使用npm拉取electron时，需要使用特别的镜像源地址，否则会出现不可预期的错误。
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