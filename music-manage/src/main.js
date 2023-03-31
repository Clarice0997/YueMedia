// import modules
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueCookies from 'vue-cookies'
import echarts from 'echarts'

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

// 引入 Echarts
Vue.prototype.$echarts = echarts

// permission控制
import './permission'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
