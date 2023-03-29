import Vue from 'vue'
import VueRouter from 'vue-router'

// 路由
import login from '@/views/Login'

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
    redirect: '/login/login',
    children: [
      {
        path: 'login',
        component: () => import(/* webpackChunkName: "loginComponent" */ '@/components/login/Login.vue'),
        meta: {
          title: '登录页面'
        }
      },
      {
        path: 'register',
        component: () => import(/* webpackChunkName: "registerComponent" */ '@/components/login/Register.vue'),
        meta: {
          title: '注册页面'
        }
      }
    ]
  },
  {
    path: '/home',
    name: '主页',
    component: () => import(/* webpackChunkName: "homeComponent" */ '@/views/Home'),
    meta: {
      title: '主页',
      requireAuth: true
    }
  }
]

const router = new VueRouter({
  routes
})

export default router
