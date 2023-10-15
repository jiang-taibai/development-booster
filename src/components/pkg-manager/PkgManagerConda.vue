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
      <!-- Conda路径 -->
      <div class="form-item">
        <div class="form-long-title">conda：</div>
        <div class="form-content">
          <n-popover trigger="hover" :delay="500"
                     :disabled="pkgData.path.length === 0">
            <template #trigger>
              <n-input v-model:value="pkgData.path" type="text" placeholder="请选择 conda.exe 文件路径"
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
            <n-button @click="loadPkgManagerData(pkgData.path)" :disabled="pkgData.path.length === 0"
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
            打开该页面时，是否重新加载 Conda 的数据
          </n-tooltip>
        </div>
      </div>
    </n-card>

    <n-card title="conda 设置" style="margin-top: 8px">
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
                    @click="loadPkgManagerData(pkgData.path)">
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
            <span class="mask-text">尚未选定 conda，请在基本信息设置中操作</span>
          </div>
        </div>

        <n-collapse>
          <!-- 命令参数 -->
          <n-collapse-item name="command-line" :disabled="true">
            <template #header>
              <n-tooltip trigger="hover" :delay="500">
                <template #trigger>
                  <div class="collapse-title">
                    <span>命令参数</span>
                    <n-rate style="margin-left: 4px" readonly :default-value="3" :count="3"/>
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
          <n-collapse-item name="system">
            <template #header>
              <n-tooltip trigger="hover" :delay="500">
                <template #trigger>
                  <div class="collapse-title">
                    <span>环境配置</span>
                    <n-rate style="margin-left: 4px" readonly :default-value="2" :count="3"/>
                  </div>
                </template>
                该配置仅作用于当前环境，不会影响其他 Conda 环境。优先级仅次于命令行参数。
              </n-tooltip>
            </template>
            <template #header-extra>
              <span>环境专享的配置</span>
            </template>
            <!-- 展示软件包来源 -->
            <n-card>
              <div class="form-item" style="margin-bottom: 0">
                <div class="form-long-title">显示软件包来源：</div>
                <div class="form-content">
                  <div style="display: flex; align-items: center; gap: 8px; color: #666666">
                    <n-switch v-model:value="detailData.configurations.system.showChannelUrls"
                              @update:value="detailDataChanged = true"/>
                    <span
                        v-if="detailData.configurations.system.showChannelUrls">是的，安装时展示每个软件包的来源 URL</span>
                    <span v-else>不，安装时无需展示软件包的来源 URL</span>
                  </div>
                </div>
                <div class="form-extra">
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <Iconfont class="tip-icon" :size="20" name="&#xe83f;"></Iconfont>
                    </template>
                    <span>在执行命令如 conda install/list/search 时，是否显示每个软件包的通道URL</span>
                  </n-tooltip>
                </div>
              </div>
            </n-card>
            <!-- 主 镜像仓库 -->
            <n-card style="margin-top: 8px">
              <template #header>
                <span>主镜像</span>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  <span>Conda 默认使用该镜像源列表拉取包</span>
                </n-tooltip>
              </template>

              <n-dynamic-input
                  @create="onCreateRegistry"
                  v-model:value="detailData.configurations.system.channels"
                  @update:value="detailDataChanged = true;"
                  show-sort-button>
                <template #default="{value, index}">
                  <n-popover trigger="hover" :delay="500"
                             :disabled="!detailData.configurations.system.channels[index]">
                    <template #trigger>
                      <n-select v-model:value="detailData.configurations.system.channels[index]" filterable
                                @update:value="detailDataChanged = true;"
                                placeholder="请选择镜像源"
                                :options="detailRegistryList" :render-option="renderPkgRegistryOption"
                                :render-label="renderPkgRegistryLabel"/>
                    </template>
                    <span>{{ detailData.configurations.system.channels[index] }}</span>
                  </n-popover>
                </template>
              </n-dynamic-input>
            </n-card>
            <!-- 自定义 镜像仓库 -->
            <n-card style="margin-top: 8px">
              <template #header>
                自定义镜像
                <n-tooltip trigger="hover" :width="300">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  <span>若设置了 conda-forge 的自定义镜像，则需要使用 `conda install some-package -c conda-forge` 才可在该镜像中下载包</span>
                </n-tooltip>
              </template>
              <n-dynamic-input
                  @create="onCreateCloudRegistry"
                  v-model:value="detailData.configurations.system.customChannels"
                  @update:value="detailDataChanged = true;"
                  show-sort-button>
                <template #default="{value, index}">
                  <div class="select-group">
                    <n-select v-model:value="value.name"
                              filterable tag placeholder="自定义镜像名称"
                              style="width: 200px"
                              :options="detailCloudKeys"/>
                    <n-popover trigger="hover" :delay="500"
                               :disabled="!value.url">
                      <template #trigger>
                        <n-select v-model:value="value.url" filterable tag
                                  @update:value="detailDataChanged = true;"
                                  placeholder="请选择镜像源"
                                  :options="detailCloudRegistryList" :render-option="renderPkgRegistryOption"
                                  :render-label="renderPkgRegistryLabel"/>
                      </template>
                      <span>{{ value.name }}: {{ value.url }}</span>
                    </n-popover>
                  </div>
                </template>
              </n-dynamic-input>
            </n-card>
          </n-collapse-item>
          <!-- 用户配置 -->
          <n-collapse-item name="env">
            <template #header>
              <n-tooltip trigger="hover" :delay="500" :width="300">
                <template #trigger>
                  <div class="collapse-title">
                    <span>用户配置</span>
                    <n-rate style="margin-left: 4px" readonly :default-value="1" :count="3"/>
                  </div>
                </template>
                该配置仅作用于当前用户，不会影响其他用户。该配置共享于当前用户下所有python环境，但优先级次于环境配置。
              </n-tooltip>
            </template>
            <template #header-extra>
              <span>用户专享的配置，用户下所有环境共享</span>
            </template>
            <!-- 展示软件包来源 -->
            <n-card>
              <div class="form-item" style="margin-bottom: 0">
                <div class="form-long-title">显示软件包来源：</div>
                <div class="form-content">
                  <div style="display: flex; align-items: center; gap: 8px; color: #666666">
                    <n-switch v-model:value="detailData.configurations.env.showChannelUrls"
                              @update:value="detailDataChanged = true"/>
                    <span
                        v-if="detailData.configurations.env.showChannelUrls">是的，安装时展示每个软件包的来源 URL</span>
                    <span v-else>不，安装时无需展示软件包的来源 URL</span>
                  </div>
                </div>
                <div class="form-extra">
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <Iconfont class="tip-icon" :size="20" name="&#xe83f;"></Iconfont>
                    </template>
                    <span>在执行命令如 conda install/list/search 时，是否显示每个软件包的通道URL</span>
                  </n-tooltip>
                </div>
              </div>
            </n-card>
            <!-- 主 镜像仓库 -->
            <n-card style="margin-top: 8px">
              <template #header>
                <span>主镜像</span>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  <span>Conda 默认使用该镜像源列表拉取包</span>
                </n-tooltip>
              </template>

              <n-dynamic-input
                  @create="onCreateRegistry"
                  v-model:value="detailData.configurations.env.channels"
                  @update:value="detailDataChanged = true;"
                  show-sort-button>
                <template #default="{value, index}">
                  <n-popover trigger="hover" :delay="500"
                             :disabled="!detailData.configurations.env.channels[index]">
                    <template #trigger>
                      <n-select v-model:value="detailData.configurations.env.channels[index]" filterable
                                @update:value="detailDataChanged = true;"
                                placeholder="请选择镜像源"
                                :options="detailRegistryList" :render-option="renderPkgRegistryOption"
                                :render-label="renderPkgRegistryLabel"/>
                    </template>
                    <span>{{ detailData.configurations.env.channels[index] }}</span>
                  </n-popover>
                </template>
              </n-dynamic-input>
            </n-card>
            <!-- 自定义 镜像仓库 -->
            <n-card style="margin-top: 8px">
              <template #header>
                自定义镜像
                <n-tooltip trigger="hover" :width="300">
                  <template #trigger>
                    <Iconfont class="tip-icon" :size="20" name="&#xe83e;"></Iconfont>
                  </template>
                  <span>若设置了 conda-forge 的自定义镜像，则需要使用 `conda install some-package -c conda-forge` 才可在该镜像中下载包</span>
                </n-tooltip>
              </template>
              <n-dynamic-input
                  @create="onCreateCloudRegistry"
                  v-model:value="detailData.configurations.env.customChannels"
                  @update:value="detailDataChanged = true;"
                  show-sort-button>
                <template #default="{value, index}">
                  <div class="select-group">
                    <n-select v-model:value="value.name"
                              filterable tag placeholder="自定义镜像名称"
                              style="width: 200px"
                              :options="detailCloudKeys"/>
                    <n-popover trigger="hover" :delay="500"
                               :disabled="!value.url">
                      <template #trigger>
                        <n-select v-model:value="value.url" filterable tag
                                  @update:value="detailDataChanged = true;"
                                  placeholder="请选择镜像源"
                                  :options="detailCloudRegistryList" :render-option="renderPkgRegistryOption"
                                  :render-label="renderPkgRegistryLabel"/>
                      </template>
                      <span>{{ value.name }}: {{ value.url }}</span>
                    </n-popover>
                  </div>
                </template>
              </n-dynamic-input>
            </n-card>

          </n-collapse-item>
        </n-collapse>

      </div>
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
import {ElNotification} from 'element-plus'

const {exec} = require('child_process');

import {h} from 'vue'

import SemverUtil from "@/assets/js/SemverUtil"
import {CondaRegistries, CondaCloudRegistries, CondaCloudKeys} from "@/assets/registry/conda"
import SvgIconLoading from "@/components/svg-icon/SvgIconLoading.vue";
import {robustPath} from "@/assets/js/utils/repath";

export default {
  name: 'PkgManagerConda',
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
    NCollapse, NCollapseItem, NRate, NUpload,
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
          system: {
            channels: [],
            customChannels: [],
            showChannelUrls: false,
          },
          env: {
            channels: [],
            customChannels: [],
            showChannelUrls: false,
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
      detailRegistryList: CondaRegistries,
      detailCloudRegistryList: CondaCloudRegistries,
      detailCloudKeys: CondaCloudKeys,

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
    // 处理选择的 conda 路径
    handlePkgPathSelect(event) {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      this.detailDataLoading = true;

      const correctFileNames = ["conda.exe"];
      if (!correctFileNames.includes(file.name)) {
        ElNotification({
          title: '错误',
          message: '请选择 conda.exe 文件',
          type: 'warning',
        });
        this.detailDataLoading = false;
        return;
      }

      this.verifyPkgManager(file.path).then((version) => {
        this.pkgData.path = file.path;
        this.detailData.version = version;
        // 如果校验成功，那么
        this.loadPkgManagerData(file.path)
      }).catch((error) => {
        ElNotification({
          title: '错误',
          message: error,
          type: 'warning',
        })
        this.detailDataLoading = false;
      })

    },
    // 通过获取 conda 的版本来校验 conda 的路径是否正确
    verifyPkgManager(condaPath) {
      return new Promise((resolve, reject) => {
        let verified = false;
        exec(robustPath(condaPath) + ' -V', (error, stdout, stderr) => {
          // 在开发环境中的输出结果为：conda 23.1.0
          let output = stdout.trim();
          // 如果获取失败，或者校验version出不是SemVer格式
          if (error) {
            reject("无效的 conda 路径: " + error);
          }
          if (!SemverUtil.containSemver(output)) {
            reject('获取的 conda 版本号不符合预期要求: ' + output);
          }
          let parsedVersion = SemverUtil.parseIgnoreAnchor(output);
          resolve(parsedVersion.version);
        });
      })
    },
    // 读取包管理器的配置
    loadPkgManagerData(condaPath) {
      if (!condaPath || condaPath.length === 0) {
        ElNotification({
          title: '错误',
          message: '无效的 conda 路径',
          type: 'warning',
        });
        return;
      }
      this.detailDataLoading = true;
      this.detailDataLoaded = false;
      let that = this;
      // let start = new Date().getTime();
      const commands = [
        robustPath(condaPath) + ' config --get custom_channels default_channels channels show_channel_urls --json --system',
        robustPath(condaPath) + ' config --get custom_channels default_channels channels show_channel_urls --json --env',
      ];

      const commandString = commands.join(' & ');

      new Promise((resolve, reject) => {
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            reject(error);
          }
          // 正常来说，stdout 的输出应该是两个 JSON 对象
          /*
          {
            "get": {
              "channels": [
                "https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/",
                "defaults"
              ]
            },
            "rc_path": "D:\\Environments\\Anaconda3\\.condarc",
            "success": true,
            "warnings": []
          }
          {
            "get": {
              "channels": [
                "defaults"
              ],
              "default_channels": [
                "https://mirrors.bfsu.edu.cn/anaconda/pkgs/main"
              ]
            },
            "rc_path": "C:\\Users\\Administrator\\.condarc",
            "success": true,
            "warnings": []
          }
           */
          // 使用正则表达式分割字符串
          const jsonStrings = stdout.trim().split(/\}\s*\{/).map((s, i, arr) => {
            if (i === 0) {
              return s + "}";
            } else if (i === arr.length - 1) {
              return "{" + s;
            } else {
              return "{" + s + "}";
            }
          });

          // 使用 JSON.parse 解析每个 JSON 字符串
          const configurations = jsonStrings.map(str => JSON.parse(str));

          const levels = ['system', 'env'];
          for (let i = 0; i < levels.length; i++) {
            if (!configurations[i].success) {
              reject(`无法获取 ${levels[i]} 级别的配置信息`);
            }

            that.detailData.configurations[levels[i]].channels = configurations[i].get.channels || [];
            // 如果 channels 中包含 defaults，那么就把 default_channels 中的内容也加入到 channels 中
            if (that.detailData.configurations[levels[i]].channels.includes('defaults')) {
              // 去掉 defaults
              that.detailData.configurations[levels[i]].channels = that.detailData.configurations[levels[i]].channels.filter(channel => channel !== 'defaults');
              // 添加 default_channels
              that.detailData.configurations[levels[i]].channels = that.detailData.configurations[levels[i]].channels.concat(configurations[i].get.default_channels || []);
            }
            that.detailData.configurations[levels[i]].customChannels = []
            for (const custom_channel in configurations[i].get.custom_channels || {}) {
              that.detailData.configurations[levels[i]].customChannels.push({
                name: custom_channel,
                url: configurations[i].get.custom_channels[custom_channel]
              })
            }
            that.detailData.configurations[levels[i]].showChannelUrls = configurations[i].get.show_channel_urls || false;

          }

          console.log(that.detailData.configurations)

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

    // 以下为 conda 的配置修改
    onCreateRegistry() {
      return void 0;
    },
    onCreateCloudRegistry() {
      return {
        name: void 0,
        url: void 0,
      }
    },
    // 确认修改 conda 配置，一次性删除所有相关配置，再重新添加
    confirmModification() {
      this.detailDataSynchronizing = true;
      let that = this;
      const commands = [
        `${robustPath(this.pkgData.path)} config --remove-key channels --remove-key custom_channels --remove-key show_channel_urls --remove-key default_channels --env`,
        `${robustPath(this.pkgData.path)} config --remove-key channels --remove-key custom_channels --remove-key show_channel_urls --remove-key default_channels --system`,
      ];
      for (const level of ["system", "env"]) {
        // 添加 channels
        let commandList = ""
        if (this.detailData.configurations[level].channels.length > 0) {
          this.detailData.configurations[level].channels.forEach(channel => {
            commandList += ` --append default_channels ${channel}`
          })
        }
        commandList += ` --append channels defaults`
        if (commandList.length > 0) {
          commands.push(`${robustPath(this.pkgData.path)} config ${commandList} --${level}`);
          commandList = ""
        }

        if (this.detailData.configurations[level].customChannels.length > 0) {
          this.detailData.configurations[level].customChannels.forEach(channel => {
            commandList += ` --set custom_channels.${channel.name} ${channel.url}`
          })
        }
        if (this.detailData.configurations[level].showChannelUrls) {
          commandList += ` --set show_channel_urls true`
        } else {
          commandList += ` --set show_channel_urls false`
        }
        if (commandList.length > 0) {
          commands.push(`${robustPath(this.pkgData.path)} config ${commandList} --${level}`);
        }
      }

      const commandString = commands.join(' & ');
      new Promise((resolve, reject) => {
        exec(commandString, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing commands: ${error}`);
            reject(error);
          }
          console.log("commandString: " + commandString)
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

  },
  mounted() {
    this.pkgData = JSON.parse(JSON.stringify(this.data.pkgData));
    this.detailData = JSON.parse(JSON.stringify(this.data.detailData));
    if (this.pkgData.path.length > 0) {
      if (!this.pkgData.reloadWhenOpen && this.detailData.version.length > 0) {
        this.detailDataLoaded = true;
      } else if (this.pkgData.reloadWhenOpen) {
        this.loadPkgManagerData(this.pkgData.path);
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
  max-width: 320px;
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

.select-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>