import DefaultTheme from 'vitepress/theme'
import BilibiliCommentManager from '../components/BilibiliCommentManager.vue'
import './custom.css' // ✅ 正确加载自定义样式

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('BilibiliCommentManager', BilibiliCommentManager)
  }
}