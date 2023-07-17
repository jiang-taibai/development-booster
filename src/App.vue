<template>
  <n-config-provider :hljs="hljs">
    <router-view/>
  </n-config-provider>
</template>

<script>
import {NConfigProvider} from 'naive-ui'
import {defineComponent} from 'vue'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import bash from 'highlight.js/lib/languages/bash'


hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('bash', bash)

export default defineComponent({
  components: {
    NConfigProvider
  },
  setup() {

    return {
      hljs,
    }
  },
  mounted() {
    this.$store.dispatch('loadDataFromLocalFile');
  }
})
</script>

<style>


body {
  padding: 0;
  margin: 0;
}
</style>