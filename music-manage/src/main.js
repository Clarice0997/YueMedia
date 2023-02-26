import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 重置css样式
import '@/assets/css/reset.css'

// element-ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 注册elementui插件
Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
