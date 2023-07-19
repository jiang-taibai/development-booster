<template>
  <div id="main">

    <n-card title="基本信息设置">
      <!-- 备注 -->
      <div class="form-item">
        <div class="form-long-title">备注：</div>
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
      <!-- pip路径 -->
      <div class="form-item">
        <div class="form-long-title">pip/python：</div>
        <div class="form-content">
          <n-popover trigger="hover" :delay="500"
                     :disabled="pkgData.path.length === 0">
            <template #trigger>
              <n-input v-model:value="pkgData.path" type="text" placeholder="请选择 pip/pip3/python.exe 文件路径"
                       :disabled="true"/>
            </template>
            <span>{{ pkgData.path }}</span>
          </n-popover>
        </div>
        <div class="form-extra">
          <n-button-group>
            <n-button @click="modifyPath"
                      :loading="detailDataLoading || detailDataSynchronizing" style="padding: 7px">
              <template #icon>
                <Iconfont name="&#xe83d;"></Iconfont>
              </template>
            </n-button>
            <n-button @click="loadPipData(pkgData.path)" :disabled="pkgData.path.length === 0"
                      :loading="detailDataLoading || detailDataSynchronizing" style="padding: 7px">
              <template #icon>
                <Iconfont name="&#xe88a;"></Iconfont>
              </template>
            </n-button>
          </n-button-group>
          <input style="display: none" type="file" ref="pkgPathSelector"
                 :multiple="false" accept=".exe" @change="handlePkgPathSelect">
        </div>
      </div>
      <!-- 启动时是否重新加载 -->
      <div class="form-item">
        <div class="form-long-title">自动重载：</div>
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
            打开该页面时，是否重新加载pnpm的数据
          </n-tooltip>
        </div>
      </div>
    </n-card>

    <n-card title="pip 设置" style="margin-top: 8px">
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
                    @click="loadPipData(pkgData.path)">
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
            <span class="mask-text">尚未选定pip，请在基本信息设置中操作</span>
          </div>
        </div>

        <n-collapse>
          <n-collapse-item name="command-line" :disabled="true">
            <template #header>
              <n-tooltip trigger="hover" :delay="500">
                <template #trigger>
                  <div class="collapse-title">
                    <span>命令参数</span>
                    <n-rate style="margin-left: 4px" readonly :default-value="4" :count="4"/>
                  </div>
                </template>
                执行命令时所附带的参数优先级最高
              </n-tooltip>
            </template>
            <template #header-extra>
              <span>执行命令时附加的参数优先级最高（仅做说明）</span>
            </template>
          </n-collapse-item>
          <!-- 环境配置 -->
          <n-collapse-item name="site">
            <template #header>
              <n-tooltip trigger="hover" :delay="500">
                <template #trigger>
                  <div class="collapse-title">
                    <span>环境配置</span>
                    <n-rate style="margin-left: 4px" readonly :default-value="3" :count="4"/>
                  </div>
                </template>
                该配置仅作用于当前python环境，不会影响其他环境。优先级仅次于命令行参数。
              </n-tooltip>
            </template>
            <template #header-extra>
              <span>环境专享的配置</span>
            </template>
            <!-- 主 镜像仓库 -->
            <n-card>
              <template #header>
                <span>主镜像</span>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  <span>pip 将优先使用该镜像源拉取包，配置项为 "global.index-url"</span>
                </n-tooltip>
              </template>

              <div class="form-item">
                <!--            <div class="form-long-title">主镜像：</div>-->
                <div style="flex: 1">
                  <n-popover trigger="hover" :delay="500"
                             :disabled="!detailData.configurations.site.majorRegistry">
                    <template #trigger>
                      <n-select v-model:value="detailData.configurations.site.majorRegistry" filterable
                                @update:value="detailDataChanged = true;" placeholder="请选择镜像源"
                                :options="detailRegistryList" :render-option="renderPkgRegistryOption"
                                :render-label="renderPkgRegistryLabel"/>
                    </template>
                    <span>{{ detailData.configurations.site.majorRegistry }}</span>
                  </n-popover>
                </div>
              </div>
            </n-card>
            <!-- 次 镜像仓库 -->
            <n-card style="margin-top: 8px">
              <template #header>
                次镜像（访问顺序从上至下）
                <n-tooltip trigger="hover" :width="300">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  pip 在主镜像中找不到包时，将在次镜像寻找<br/>配置项为 "global.extra-index-url"
                </n-tooltip>
              </template>
              <n-dynamic-input
                  @create="onCreateMinorRegistry"
                  v-model:value="detailData.configurations.site.minorRegistries"
                  @update:value="detailDataChanged = true;"
                  show-sort-button>
                <template #default="{value, index}">
                  <n-popover trigger="hover" :delay="500"
                             :disabled="!detailData.configurations.site.minorRegistries[index]">
                    <template #trigger>
                      <n-select v-model:value="detailData.configurations.site.minorRegistries[index]" filterable
                                @update:value="detailDataChanged = true;"
                                placeholder="请选择镜像源"
                                :options="detailRegistryList" :render-option="renderPkgRegistryOption"
                                :render-label="renderPkgRegistryLabel"/>
                    </template>
                    <span>{{ detailData.configurations.site.minorRegistries[index] }}</span>
                  </n-popover>
                </template>
              </n-dynamic-input>
            </n-card>
          </n-collapse-item>
          <!-- 用户配置 -->
          <n-collapse-item name="user">
            <template #header>
              <n-tooltip trigger="hover" :delay="500" :width="300">
                <template #trigger>
                  <div class="collapse-title">
                    <span>用户配置</span>
                    <n-rate style="margin-left: 4px" readonly :default-value="2" :count="4"/>
                  </div>
                </template>
                该配置仅作用于当前用户，不会影响其他用户。该配置共享于当前用户下所有python环境，但优先级次于环境配置。
              </n-tooltip>
            </template>
            <template #header-extra>
              <span>用户专享的配置，用户下所有环境共享</span>
            </template>
            <!-- 主 镜像仓库 -->
            <n-card>
              <template #header>
                <span>主镜像</span>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  <span>pip 将优先使用该镜像源拉取包，配置项为 "global.index-url"</span>
                </n-tooltip>
              </template>
              <div class="form-item">
                <!--            <div class="form-long-title">主镜像：</div>-->
                <div style="flex: 1">
                  <n-popover trigger="hover" :delay="500"
                             :disabled="!detailData.configurations.user.majorRegistry">
                    <template #trigger>
                      <n-select v-model:value="detailData.configurations.user.majorRegistry" filterable
                                @update:value="detailDataChanged = true;"
                                placeholder="请选择镜像源"
                                :options="detailRegistryList" :render-option="renderPkgRegistryOption"
                                :render-label="renderPkgRegistryLabel"/>
                    </template>
                    <span>{{ detailData.configurations.user.majorRegistry }}</span>
                  </n-popover>
                </div>
              </div>
            </n-card>
            <!-- 次 镜像仓库 -->
            <n-card style="margin-top: 8px">
              <template #header>
                次镜像（访问顺序从上至下）
                <n-tooltip trigger="hover" :width="300">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  pip 在主镜像中找不到包时，将在次镜像寻找<br/>配置项为 "global.extra-index-url"
                </n-tooltip>
              </template>
              <n-dynamic-input
                  @create="onCreateMinorRegistry"
                  v-model:value="detailData.configurations.user.minorRegistries"
                  @update:value="detailDataChanged = true;"
                  show-sort-button>
                <template #default="{value, index}">
                  <n-popover trigger="hover" :delay="500"
                             :disabled="!detailData.configurations.user.minorRegistries[index]">
                    <template #trigger>
                      <n-select v-model:value="detailData.configurations.user.minorRegistries[index]" filterable
                                @update:value="detailDataChanged = true;"
                                placeholder="请选择镜像源"
                                :options="detailRegistryList" :render-option="renderPkgRegistryOption"
                                :render-label="renderPkgRegistryLabel"/>
                    </template>
                    <span>{{ detailData.configurations.user.minorRegistries[index] }}</span>
                  </n-popover>
                </template>
              </n-dynamic-input>
            </n-card>
          </n-collapse-item>
          <!-- 全局配置 -->
          <n-collapse-item name="global">
            <template #header>
              <n-tooltip trigger="hover" :delay="500" :width="300">
                <template #trigger>
                  <div class="collapse-title">
                    <span>全局配置</span>
                    <n-rate style="margin-left: 4px" readonly :default-value="1" :count="4"/>
                  </div>
                </template>
                该配置作用于所有用户。该配置共享于所有用户下所有python环境，但优先级次于用户配置。
              </n-tooltip>
            </template>
            <template #header-extra>
              <span>全用户全环境共享的配置，优先级最低</span>
            </template>
            <!-- 主 镜像仓库 -->
            <n-card>
              <template #header>
                <span>主镜像</span>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  <span>pip 将优先使用该镜像源拉取包，配置项为 "global.index-url"</span>
                </n-tooltip>
              </template>
              <div class="form-item">
                <!--            <div class="form-long-title">主镜像：</div>-->
                <div style="flex: 1">
                  <n-popover trigger="hover" :delay="500"
                             :disabled="!detailData.configurations.global.majorRegistry">
                    <template #trigger>
                      <n-select v-model:value="detailData.configurations.global.majorRegistry" filterable
                                @update:value="detailDataChanged = true;"
                                placeholder="请选择镜像源"
                                :options="detailRegistryList" :render-option="renderPkgRegistryOption"
                                :render-label="renderPkgRegistryLabel"/>
                    </template>
                    <span>{{ detailData.configurations.global.majorRegistry }}</span>
                  </n-popover>
                </div>
              </div>
            </n-card>
            <!-- 次 镜像仓库 -->
            <n-card style="margin-top: 8px">
              <template #header>
                次镜像（访问顺序从上至下）
                <n-tooltip trigger="hover" :width="300">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  pip 在主镜像中找不到包时，将在次镜像寻找<br/>配置项为 "global.extra-index-url"
                </n-tooltip>
              </template>
              <n-dynamic-input
                  @create="onCreateMinorRegistry"
                  v-model:value="detailData.configurations.global.minorRegistries"
                  @update:value="detailDataChanged = true;"
                  show-sort-button>
                <template #default="{value, index}">
                  <n-popover trigger="hover" :delay="500"
                             :disabled="!detailData.configurations.global.minorRegistries[index]">
                    <template #trigger>
                      <n-select v-model:value="detailData.configurations.global.minorRegistries[index]" filterable
                                @update:value="detailDataChanged = true;"
                                placeholder="请选择镜像源"
                                :options="detailRegistryList" :render-option="renderPkgRegistryOption"
                                :render-label="renderPkgRegistryLabel"/>
                    </template>
                    <span>{{ detailData.configurations.global.minorRegistries[index] }}</span>
                  </n-popover>
                </template>
              </n-dynamic-input>
            </n-card>
          </n-collapse-item>
        </n-collapse>


      </div>
    </n-card>

    <n-card title="pip 本地安装" style="margin-top: 8px">
      <n-upload accept=".whl" :custom-request="installWhl" :show-file-list="false"
                :disabled="whlInstalling || (!detailDataLoaded && (!pkgData.reloadWhenOpen && !detailData.version))">
        <n-upload-dragger>
          <div v-if="!detailDataLoaded && (!pkgData.reloadWhenOpen && !detailData.version)">
            <Iconfont name="&#xe842;" style="margin-right: 8px"/>
            <span class="mask-text">尚未选定pip，请在基本信息设置中操作</span>
          </div>
          <div v-else-if="whlInstalling">
            <div style="margin-bottom: 12px">
              <svg-icon-loading/>
            </div>
            <span v-if="whlInstallingFile">正在安装：{{ whlInstallingFile.name }}</span>
            <span v-else>正在安装中……</span>
          </div>
          <div v-else>
            <div style="margin-bottom: 12px">
              <Iconfont name="&#xe847;"/>
            </div>
            <span>点击或者拖动whl文件到该区域安装</span>
          </div>
        </n-upload-dragger>
      </n-upload>
    </n-card>

  </div>
</template>

<script>
import Iconfont from "@/components/Iconfont.vue";
import {
  NInput, NButton, NCard, NSelect, NTooltip,
  NSwitch, NCode, NButtonGroup, NSpin, NPopover,
  NList, NListItem, NThing, NCheckbox, NDynamicInput,
  NCollapse, NCollapseItem, NRate, NUpload, NUploadDragger,
} from 'naive-ui'

import 'element-plus/es/components/notification/style/css'
import {ElMessageBox, ElNotification} from 'element-plus'

const {exec} = require('child_process');

import {h} from 'vue'

import SemverUtil from "@/assets/js/SemverUtil"
import PipConfigDebugResolver from "@/assets/js/PipConfigDebugResolver"
import {PipRegistries} from "@/assets/registry/pip"
import SvgIconLoading from "@/components/svg-icon/SvgIconLoading.vue";

export default {
  name: 'PkgManagerPip',
  props: {
    data: {
      type: Object,
      required: true,
    }
  },
  components: {
    // ElementPlus
    Notification,
    // 自定义组件
    Iconfont, SvgIconLoading,
    // NaiveUI
    NInput, NButton, NCard, NSelect, NTooltip,
    NSwitch, NCode, NButtonGroup, NSpin, NPopover,
    NList, NListItem, NThing, NCheckbox, NDynamicInput,
    NCollapse, NCollapseItem, NRate, NUpload, NUploadDragger,
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
          site: {
            majorRegistry: null,
            minorRegistries: [],
          },
          user: {
            majorRegistry: null,
            minorRegistries: [],
          },
          global: {
            majorRegistry: null,
            minorRegistries: [],
          },
        }
      },
      detailDataLoading: false,
      // pip 数据是否已经加载
      detailDataLoaded: false,
      // pip 数据是否发生了变化
      detailDataChanged: false,
      // pip 数据是否正在同步
      detailDataSynchronizing: false,
      detailRegistryList: PipRegistries,

      // 待安装的whl文件
      whlInstalling: false,
      whlInstallingFile: null,
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
    // 处理选择的pip路径
    handlePkgPathSelect(event) {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      this.detailDataLoading = true;

      const correctFileNames = ["python.exe", "python3.exe", "pip.exe", "pip3.exe"];
      if (!correctFileNames.includes(file.name)) {
        ElNotification({
          title: '错误',
          message: '请选择pip/pip3/python.exe文件',
          type: 'warning',
        });
        this.detailDataLoading = false;
        return;
      }

      this.verifyPip(file.path).then((version) => {
        this.pkgData.path = file.path;
        this.detailData.version = version;
        // 如果校验成功，那么
        this.loadPipData(file.path)
      }).catch((error) => {
        ElNotification({
          title: '错误',
          message: error,
          type: 'warning',
        })
      })

    },
    // 根据提供的路径，如果是python.exe，那么就在后面加上" -m pip"
    autoCommandPrefix(purePath) {
      if (purePath.endsWith("python.exe")) {
        return purePath + " -m pip"
      } else if (purePath.endsWith("python3.exe")) {
        return purePath + " -m pip"
      } else {
        return purePath
      }
    },
    // 通过获取pip的版本来校验pip的路径是否正确
    verifyPip(pnpmPath) {
      return new Promise((resolve, reject) => {
        let verified = false;
        exec(pnpmPath + ' -m pip -V', (error, stdout, stderr) => {
          // 在开发环境中的输出结果为：pip 23.1.2 from D:\Environments\Anaconda3\envs\py38\lib\site-packages\pip (python 3.8)
          let output = stdout.trim();
          // 如果获取失败，或者校验version出不是SemVer格式
          if (error) {
            reject("无效的pip/pip3/python路径: " + error);
          }
          if (!SemverUtil.containSemver(output)) {
            reject('获取的pip/pip3/python版本号不符合预期要求: ' + output);
          }
          let parsedVersion = SemverUtil.parseIgnoreAnchor(output);
          resolve(parsedVersion.version);
        });
      })
    },
    // 读取pip的配置
    loadPipData(pipPath) {
      if (!pipPath || pipPath.length === 0) {
        ElNotification({
          title: '错误',
          message: '无效的pip/pip3/python路径',
          type: 'warning',
        });
        return;
      }
      this.detailDataLoading = true;
      this.detailDataLoaded = false;
      let that = this;
      // let start = new Date().getTime();
      const commands = [
        this.autoCommandPrefix(pipPath) + ' config debug'
      ];

      const commandString = commands.join(' & ');

      new Promise((resolve, reject) => {
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            reject(error);
          }
          let parsedConfiguration = PipConfigDebugResolver(stdout);
          // console.log(parsedConfiguration)

          const scopes = ['site', 'user', 'global'];
          for (const scope of scopes) {
            if (parsedConfiguration[scope]['global.index-url'].length > 0) {
              that.detailData.configurations[scope].majorRegistry = parsedConfiguration[scope]['global.index-url'][0];
            }
            that.detailData.configurations[scope].minorRegistries = parsedConfiguration[scope]['global.extra-index-url'];
          }

          // console.log(that.detailData.configurations)

          resolve();
        });
      }).then(() => {
        // let endTime = new Date().getTime();
        // console.log("读取pip配置耗时: " + (endTime - start) + "ms");
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
    renderPkgRegistryOption({node, option}) {
      if (option.type === "group") return node
      return h(NTooltip, {delay: 500}, {
        trigger: () => node,
        default: () => `${option.value}`
      })
    },
    renderPkgRegistryLabel(option) {
      if (option.type === "group") return option.label;
      if (option.label === option.value) return option.value;
      return `${option.label} - ${option.value}`
    },

    // 以下为pip的配置修改
    onCreateMinorRegistry() {
      return void 0;
    },
    // 确认修改pip配置
    // 1. 如果仓库地址为空，那么就删除相对应的配置项
    // 2. 如果仓库地址不为空，那么就设置相对应的配置项
    // 3. 无论链接是否是https的，都设置trusted-host
    confirmModification() {
      this.detailDataSynchronizing = true;
      let that = this;
      const commands = [];
      const executorPath = this.autoCommandPrefix(this.pkgData.path);
      let scopes = ['site', 'user', 'global']
      for (const scope of scopes) {
        let majorRegistry = this.detailData.configurations[scope].majorRegistry;
        let minorRegistries = this.detailData.configurations[scope].minorRegistries;
        // 如果主仓库地址为空，那么就删除相对应的配置项
        if (!majorRegistry) {
          commands.push(executorPath + ' config unset global.index-url --' + scope);
          commands.push(executorPath + ' config unset global.trusted-host --' + scope);
          continue;
        }
        try {
          let url = new URL(majorRegistry);
          commands.push(executorPath + ' config set global.index-url ' + majorRegistry + ` --${scope}`);
          commands.push(executorPath + ' config set global.trusted-host ' + url.hostname + ` --${scope}`);
        } catch (e) {
          ElMessageBox({
            title: '错误',
            message: '无效的主仓库地址: ' + majorRegistry,
            type: 'warning',
          });
          that.detailDataSynchronizing = false;
          return;
        }

        if (minorRegistries.length === 0) {
          commands.push(executorPath + ' config unset global.extra-index-url --' + scope);
          commands.push(executorPath + ' config unset global.extra-trusted-host --' + scope);
          continue;
        }
        try {
          // 使用 filter 方法过滤空元素
          minorRegistries = minorRegistries.filter((element) => element && element.length > 0);

          let minorRegistryTrustedHosts = [];
          commands.push(executorPath + ` config set global.extra-index-url "${minorRegistries.join(" ")}" --${scope}`);
          for (const minorRegistry of minorRegistries) {
            if (!minorRegistry) continue;
            let url = new URL(minorRegistry);
            minorRegistryTrustedHosts.push(url.hostname);
          }
          commands.push(executorPath + ` config set global.extra-trusted-host "${minorRegistryTrustedHosts.join(" ")}" --${scope}`);
        } catch (e) {
          ElMessageBox({
            title: '错误',
            message: '无效的次要仓库地址: ' + e.message,
            type: 'warning',
          });
          that.detailDataSynchronizing = false;
          return;
        }
      }

      const commandString = commands.join(' & ');
      new Promise((resolve, reject) => {
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            reject(error);
          }
          // console.log("commandString: " + commandString)
          // console.log("error: " + error);
          // console.log("stdout: " + stdout);
          // console.log("stderr: " + stderr);
          that.detailDataSynchronizing = false;
          that.detailDataChanged = false;
          that.emitUpdate();
          resolve();
        });
      })
    },

    // 自定义安装
    installWhl({
                 file, data, headers, withCredentials,
                 action, onFinish, onError, onProgress
               }) {
      this.whlInstallingFile = file.file;
      this.whlInstalling = true;
      let that = this
      console.log(file)
      new Promise((resolve, reject) => {
        let commandString = that.autoCommandPrefix(that.pkgData.path) + ' install ' + file.file.path;
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}\n${stderr}`);
            reject(stderr);
          }
          resolve();
        });
      }).then(() => {
        ElNotification({
          title: '安装成功',
          message: '安装成功：' + file.file.name,
          type: 'success',
        })
        that.whlInstalling = false;
        onFinish();
      }).catch((error) => {
        ElMessageBox.alert(error, '安装失败',
            {
              confirmButtonText: '确定',
              type: 'warning',
            })
        that.whlInstalling = false;
        onError(error);
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
        this.loadPipData(this.pkgData.path);
      }
    }
  },
  watch: {},
}
</script>

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

.collapse-title {
  display: flex;
  align-items: flex-start;
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