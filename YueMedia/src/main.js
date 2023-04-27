// import modules
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueCookies from 'vue-cookies'

// 重置 css 样式
import '@/assets/css/reset.css'

// 整合 elementUI
import './plugins/element.js'

// 引入 Axios 插件
import './utils/request'

// 引入 VueCookie 处理模块
Vue.use(VueCookies)

// 引入 Font Awesome
import '@fortawesome/fontawesome-free/css/all.css'

// permission控制
import './permission'

// 引入视频播放器
import VueCoreVideoPlayer from 'vue-core-video-player'

Vue.use(VueCoreVideoPlayer, {
  lang: 'zh-CN'
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
