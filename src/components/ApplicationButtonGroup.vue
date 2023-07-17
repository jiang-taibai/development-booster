<template>
  <div>
    <span style="margin-right: 8px">
      <n-tooltip>
        <template #trigger>
          <n-button round size="small" color="#909399" @click="handleSetting">
            <template #icon>
              <n-icon>
                <Iconfont name="&#xe84a;" color="#FFFFFF"/>
              </n-icon>
            </template>
            <span>设置</span>
          </n-button>
        </template>
        <span>设置</span>
      </n-tooltip>
    </span>

  </div>
</template>

<script>
import {NButton, NTooltip, NIcon} from "naive-ui";
import Iconfont from "@/components/Iconfont.vue";
import {ElNotification} from "element-plus";

export default {
  name: 'ApplicationButtonGroup',
  components: {Iconfont, NButton, NTooltip, NIcon},
  data() {
    return {}
  },
  methods: {
    handleSetting() {
      ElNotification({
        title: '提示',
        message: '😀 功能开发中...',
        type: 'warning'
      });
    }
  },
  mounted() {

  },
}
</script>

<style scoped>
</style>