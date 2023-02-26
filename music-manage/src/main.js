import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 重置css样式
import '@/assets/css/reset.css'

// 整合elementUI
import './plugins/element.js'

// 引入Axios插件
import './utils/request'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
