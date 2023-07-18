<template>
  <n-config-provider :hljs="hljs">
    <div>
      <router-view/>
      <check-for-updates-dialog/>
    </div>
  </n-config-provider>
</template>

<script>
import {NConfigProvider} from 'naive-ui'

import {defineComponent, ref} from 'vue'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import CheckForUpdatesDialog from '@/components/dialog/CheckForUpdatesDialog.vue'

hljs.registerLanguage('bash', bash)

export default defineComponent({
  components: {
    CheckForUpdatesDialog,
    NConfigProvider,
  },
  setup() {

    return {
      hljs,
    }
  },
  mounted() {
    this.$store.dispatch('loadDataFromLocalFile');
  },
})
</script>

<style>


body {
  padding: 0;
  margin: 0;
}
</style>