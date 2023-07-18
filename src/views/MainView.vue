<template>
  <div id="container">
    <div class="left-part">
      <!-- 按钮组 -->
      <div class="button-group">
        <n-button text @click="displayAddPkgManagerDialog=true">
          <Iconfont name="&#xe835;"></Iconfont>
        </n-button>
        <n-button text @click="deletePkgManager()"
                  :disabled="currentSelectedPkgIndex < 0 || currentSelectedPkgIndex > pkgManagerList.length - 1">
          <Iconfont name="&#xe840;"></Iconfont>
        </n-button>
        <n-button text @click="shiftUpPkgManager()" :disabled="currentSelectedPkgIndex <= 0">
          <Iconfont name="&#xe845;"></Iconfont>
        </n-button>
        <n-button text @click="shiftDownPkgManager()" :disabled="currentSelectedPkgIndex >= pkgManagerList.length - 1">
          <Iconfont name="&#xe839;"></Iconfont>
        </n-button>
      </div>
      <!-- 包管理器列表 -->
      <div class="pkg-list">
        <div :class="{'pkg-item': true, 'pkg-item-selected': index===currentSelectedPkgIndex}"
             v-for="(pkg, index) in pkgManagerList" :key="index"
             @click="selectPkgManager(index)">
          <span class="pkg-item-name">{{ pkg.name }}</span>
          <span class="pkg-item-version" v-show="pkg.data.detailData.version">({{ pkg.data.detailData.version }})</span>
          <span class="pkg-item-note" v-show="pkg.data.pkgData.note">
            <br v-show="pkg.data.detailData.version"/>
            [{{ pkg.data.pkgData.note }}]</span>
        </div>
        <!-- 当包管理器列表为空时，展示该节点 -->
        <div v-show="pkgManagerList.length===0"
             style="height:100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <n-empty :show-icon="false">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;">
              <Iconfont name="&#xe708;" :size="40"/>
              <span style="text-align: center">您还没有添加任何<br/>包管理器</span>
              <n-button @click="displayAddPkgManagerDialog=true">
                <span>立即添加</span>
              </n-button>
            </div>
          </n-empty>
        </div>
      </div>
    </div>
    <!-- 根据选择的包管理器，使用相对应的component显示 -->
    <div class="right-part">
      <application-button-group class="application-button-outer"/>
      <div style="flex: 1;background-color: #fff;margin-bottom: 8px; margin-right: 8px;border-radius: 8px"
           v-if="currentSelectedPkgIndex < 0 || currentSelectedPkgIndex >= pkgManagerList.length">
        <pkg-manager-none/>
      </div>
      <n-scrollbar style="flex: 1;" v-else>
        <div class="scrollbar-outer">
          <component :is="pkgManagerList[currentSelectedPkgIndex].type"
                     :data="pkgManagerList[currentSelectedPkgIndex].data"
                     :key="pkgManagerList[currentSelectedPkgIndex].id"
                     @update:data="handleUpdateData"></component>
        </div>
      </n-scrollbar>
    </div>

    <n-modal v-model:show="displayAddPkgManagerDialog"
             title="添加包管理器"
             preset="card" style="width: 60vw">
      <template #footer>
        <div class="form-item">
          <div class="form-title"></div>
          <div class="form-content">
            <n-button type="success" style="margin-right: 8px" @click="addPkgManager">
              确定
            </n-button>
            <n-button @click="displayAddPkgManagerDialog=false">取消</n-button>
          </div>
          <div class="form-extra">

          </div>
        </div>
      </template>
      <!-- 包管理器类型 -->
      <div class="form-item">
        <div class="form-title">类型：</div>
        <div class="form-content">
          <n-select
              v-model:value="newPkgData.type"
              filterable
              placeholder="选择包管理器的类型"
              :options="allPkgManagerType"
          />
        </div>
        <div class="form-extra">

        </div>
      </div>
      <!-- 备注 -->
      <div class="form-item" style="margin-bottom: 0">
        <div class="form-title">备注：</div>
        <div class="form-content">
          <n-input v-model:value="newPkgData.note" type="text" placeholder="请输入备注"/>
        </div>
        <div class="form-extra">
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script>
import {
  NButton, NScrollbar, NModal,
  NInput, NSelect, NCard, NEmpty
} from 'naive-ui'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import {ElMessage, ElMessageBox} from "element-plus";

const Iconfont = defineAsyncComponent(() => import("@/components/Iconfont.vue"));
const PkgManagerNpm = defineAsyncComponent(() => import("@/components/pkg-manager/PkgManagerNpm.vue"));
const PkgManagerYarn = defineAsyncComponent(() => import("@/components/pkg-manager/PkgManagerYarn.vue"));
const PkgManagerPnpm = defineAsyncComponent(() => import("@/components/pkg-manager/PkgManagerPnpm.vue"));
const PkgManagerPip = defineAsyncComponent(() => import("@/components/pkg-manager/PkgManagerPip.vue"));
const PkgManagerNone = defineAsyncComponent(() => import("@/components/pkg-manager/PkgManagerNone.vue"));
const ApplicationButtonGroup = defineAsyncComponent(() => import("@/components/ApplicationButtonGroup.vue"));

import {IdGenerate} from "@/assets/js/Utils";
import {defineAsyncComponent} from "vue";

export default {
  name: 'MainView',
  components: {
    NInput, NButton, NScrollbar, NModal, NSelect, NCard,
    ElMessageBox, ElMessage, NEmpty,
    Iconfont, ApplicationButtonGroup,
    PkgManagerNone, PkgManagerNpm, PkgManagerYarn,
    PkgManagerPnpm, PkgManagerPip,
  },
  data() {
    return {
      currentSelectedPkgIndex: -1,
      pkgManagerList: [],
      displayAddPkgManagerDialog: false,
      newPkgData: {
        note: void 0,
        type: void 0,
      },
      allPkgManagerType: [
        {
          label: 'npm',
          value: 'npm',
        },
        {
          label: 'yarn',
          value: 'yarn',
        },
        {
          label: 'pnpm',
          value: 'pnpm',
        },
        {
          label: 'pip',
          value: 'pip',
        },
      ],
      defaultPkgManagerItemInfo: {
        npm: {
          id: '',
          type: "pkg-manager-npm",
          name: "npm",
          selected: false,
          data: {
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
          },
        },
        yarn: {
          id: '',
          type: "pkg-manager-yarn",
          name: "yarn",
          selected: false,
          data: {
            pkgData: {
              note: '',
              path: '',
              reloadWhenOpen: false,
            },
            detailData: {
              version: '',
              configurations: {
                registry: '',
              }
            },
          },
        },
        pnpm: {
          id: '',
          type: "pkg-manager-pnpm",
          name: "pnpm",
          selected: false,
          data: {
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
          },
        },
        pip: {
          id: '',
          type: "pkg-manager-pip",
          name: "pip",
          selected: false,
          data: {
            pkgData: {
              note: '',
              path: '',
              reloadWhenOpen: false,
            },
            detailData: {
              version: '',
              configurations: {
                site: {
                  majorRegistry: void 0,
                  minorRegistries: [],
                },
                user: {
                  majorRegistry: void 0,
                  minorRegistries: [],
                },
                global: {
                  majorRegistry: void 0,
                  minorRegistries: [],
                },
              }
            },
          },
        },
      }
    }
  },
  methods: {
    // 在包管理器列表中选中某一个包管理器
    selectPkgManager(index) {
      this.pkgManagerList.forEach((pkg, i) => {
        pkg.selected = i === index;
      });
      this.currentSelectedPkgIndex = index
    },
    // 添加一个包管理器
    addPkgManager() {
      if (!this.newPkgData.type) {
        ElMessage({
          message: '请选择包管理器类型',
          type: 'warning',
        });
        return;
      }
      this.displayAddPkgManagerDialog = false;
      let newPkgManagerItem = this.defaultPkgManagerItemInfo[this.newPkgData.type];
      // 生成一个新的id
      newPkgManagerItem.id = IdGenerate();
      // 如果有备注，则添加备注
      if (this.newPkgData.note) {
        newPkgManagerItem.data.pkgData.note = this.newPkgData.note;
      }
      this.pkgManagerList.push(newPkgManagerItem);
      // 选中这个包管理器
      this.selectPkgManager(this.pkgManagerList.length - 1)
      // 清空输入框
      this.newPkgData = {
        note: void 0,
        type: void 0,
      }
      this.saveDataToLocal()
    },
    // 删除一个包管理器
    deletePkgManager() {
      if (this.currentSelectedPkgIndex < 0) {
        ElMessage({
          type: 'warning',
          message: '请先选择一个包管理器',
        })
        return;
      }
      let that = this
      // 先弹窗确认
      ElMessageBox.confirm(
          '是否确定删除该包管理器？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
      )
          .then(() => {
            that.pkgManagerList.splice(that.currentSelectedPkgIndex, 1);
            if (that.pkgManagerList.length > 0) {
              that.selectPkgManager(0)
            } else {
              that.selectPkgManager(-1)
            }
            ElMessage({
              type: 'success',
              message: '删除成功',
            })
          })
          .catch(() => {

          })
      this.saveDataToLocal()
    },
    // 向上移动包管理器
    shiftUpPkgManager() {
      if (this.currentSelectedPkgIndex <= 0) return;
      this.pkgManagerList = this.swap(this.pkgManagerList, this.currentSelectedPkgIndex, this.currentSelectedPkgIndex - 1);
      this.selectPkgManager(this.currentSelectedPkgIndex - 1)
      this.saveDataToLocal()
    },
    // 向下移动包管理器
    shiftDownPkgManager() {
      if (this.currentSelectedPkgIndex >= this.pkgManagerList.length - 1) return;
      this.pkgManagerList = this.swap(this.pkgManagerList, this.currentSelectedPkgIndex, this.currentSelectedPkgIndex + 1);
      this.selectPkgManager(this.currentSelectedPkgIndex + 1)
      this.saveDataToLocal()
    },
    // 交换数组位置
    swap(array, index1, index2) {
      array[index1] = array.splice(index2, 1, array[index1])[0];
      return array;
    },
    // 接受子组件传递的数据（包管理器的数据）
    handleUpdateData(data) {
      this.pkgManagerList[this.currentSelectedPkgIndex].data = JSON.parse(JSON.stringify(data));
      this.saveDataToLocal();
    },
    // 保存数据到本地
    saveDataToLocal() {
      this.$store.state.pkgManagerList = this.pkgManagerList;
      this.$store.dispatch('saveDataToLocalFile');
    },
  },
  mounted() {
    if (this.$store.state.pkgManagerList) {
      this.pkgManagerList = this.$store.state.pkgManagerList;
      if (this.pkgManagerList.length > 0) {
        this.selectPkgManager(0)
      }
    }
  },
  computed: {},
  watch: {},
}
</script>

<style scoped>
#container {
  width: 100vw;
  display: flex;
}

.left-part {
  width: 200px;
  height: 100vh;
  background-color: #f0f0f0;
  display: flex;
  flex-direction: column;
}

.right-part {
  flex: 1;
  display: flex;
  background-color: #f0f0f0;
  flex-direction: column;
  height: 100vh;
}

.button-group {
  margin: 8px 8px;
  display: flex;
  gap: 4px;
}

.pkg-list {
  margin: 0 8px 8px;
  padding: 8px;
  border-radius: 8px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
}

.pkg-item {
  margin: 4px 0;
  padding: 8px;
  border-radius: 8px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: all .3s ease;
}

.pkg-item-selected {
  color: #ffffff;
  background-color: #7D9D9C;
}

.pkg-item:hover {
  color: #ffffff;
  background-color: #7D9D9C;
}

.pkg-item:active {
  color: #f0f0f0;
  background-color: #576F72;
}

.pkg-item-name {
  font-weight: 500;
}

.pkg-item-version {

}

.pkg-item-note {

}

.application-button-outer {
  margin: 8px 8px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.scrollbar-outer {
  margin-bottom: 8px;
  margin-right: 8px;
  background-color: #fff;
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
</style>