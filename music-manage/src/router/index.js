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
    redirect: () => import('@/views/Login'),
    children: [
      {
        path: 'login',
        component: () => import(/* webpackChunkName: "loginComponent" */ '@/components/login/loginForm.vue'),
        meta: {
          title: '登录页面'
        }
      },
      {
        path: 'register',
        component: () => import(/* webpackChunkName: "registerComponent" */ '@/components/login/registerForm.vue'),
        meta: {
          title: '注册页面'
        }
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
