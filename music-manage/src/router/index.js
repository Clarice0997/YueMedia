import Vue from 'vue'
import VueRouter from 'vue-router'

// 路由
import login from '@/views/login.vue'
import home from '@/views/home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: login,
    meta: {
      title: '登录页面'
    }
  },
  {
    path: '/home',
    name: 'home',
    component: home,
    meta: {
      title: '首页'
    }
  }
]

const router = new VueRouter({
  routes
})

export default router
