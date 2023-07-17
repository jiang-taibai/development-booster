<script>
export default {
  name: 'Iconfont',
  props: {
    name: {
      type: String,
      default: '',
      required: true,
    },
    size: {
      type: Number,
      default: 24
    },
    color: {
      type: String,
      default: ''
    }
  },
  computed: {
    iconStyle() {
      let style = {}
      style['font-size'] = `${this.size}px`
      if (this.color) {
        style['color'] = this.color
      }
      return style;
    }
  }
}
</script>

<template>
  <span class="iconfont" :style="iconStyle">{{ name }}</span>
</template>

<style scoped>
/* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
/*@font-face {
  font-family: 'iconfont';  !* Project id 4163521 *!
  src: url('https://at.alicdn.com/t/c/font_4163521_4zjuiykw1s.woff2?t=1689426622885') format('woff2'),
  url('https://at.alicdn.com/t/c/font_4163521_4zjuiykw1s.woff?t=1689426622885') format('woff'),
  url('https://at.alicdn.com/t/c/font_4163521_4zjuiykw1s.ttf?t=1689426622885') format('truetype');
}*/


@font-face {
  font-family: 'iconfont';
  src: url('@/assets/iconfont/iconfont.woff2?t=1689268036542') format('woff2'),
  url('@/assets/iconfont/iconfont.woff?t=1689268036542') format('woff'),
  url('@/assets/iconfont/iconfont.ttf?t=1689268036542') format('truetype');
}


.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>