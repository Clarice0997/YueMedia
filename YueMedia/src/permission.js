// import modules
import router from './router'
import { getCookie, setCookie, deleteCookie } from '@/utils/cookie'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { verify, getProfile } from '@/apis/loginAPI'
import { getRoutesAPI } from '@/apis/routesAPI'
import store from './store'
import { routeHandle } from '@/utils/routeHandle'

// 配置Nprogress项 关闭右上角螺旋加载提示
NProgress.configure({ showSpinner: false })

// 全局路由前置 （鉴权）
router.beforeEach(async (to, from, next) => {
  // 启动 NProgress 加载
  NProgress.start()

  // 判断是否存在 Token
  let hasToken = await getCookie('Access-Token')

  // 如果不存在 Token，尝试从 localStorage 中获取
  if (!hasToken) {
    let localToken = localStorage.getItem('Access-Token')
    if (localToken) {
      hasToken = localToken
      await setCookie('Access-Token', localToken)
    }
  }

  // 判断 Token 是否有效，失效则清空 Token
  if (hasToken) {
    try {
      await verify()
    } catch ({ response }) {
      if (response.data.code !== 200) {
        hasToken = undefined
        await deleteCookie('Access-Token')
        await localStorage.removeItem('Access-Token')
        await store.dispatch('dynamicRoutes/asyncClearRoutes')
        return next('/login/login')
      }
    }
  }

  // 判断跳转界面是否需要权限
  if (to.matched.some(record => record.meta.requireAuth)) {
    if (hasToken) {
      // 存在 Token 则放行，否则跳转登录页
      NProgress.done()
      return next()
    } else {
      Message({
        message: '登录已过期，请重新登录',
        type: 'error',
        duration: 1500
      })
      await store.dispatch('dynamicRoutes/asyncClearRoutes')
      NProgress.done()
      return next('/login/login')
    }
  } else if (to.path.includes('login')) {
    // 跳转登录页，判断是否已经登录
    // 登录则重定向首页，未登录则放行
    if (!hasToken) {
      NProgress.done()
      return next()
    } else {
      Message({
        message: '用户已登录，无需登录',
        type: 'warning',
        duration: 1500
      })
      NProgress.done()
      return next('/home')
    }
  } else if (to.path === '/') {
    return next()
  } else {
    return next()
  }
})

// 全局路由前置 （动态路由）
router.beforeEach(async (to, from, next) => {
  // 登录页面放行
  if (to.path === '/' || to.path.includes('login')) {
    return next()
  }

  // 判断 Vuex 中是否存在路由数据
  if (store.getters['dynamicRoutes/getDynamicRoutes'].length === 0) {
    // 获取动态路由菜单
    const {
      data: { routes }
    } = await getRoutesAPI()
    // 处理返回路由对象
    const Routes = await routes.map(route => {
      const originRoute = {
        path: route.path,
        name: route.name,
        redirect: route.redirect ? route.redirect : undefined,
        component: () => import(`@/${route.component}`),
        meta: JSON.parse(route.meta),
        children: []
      }
      // 为元路由对象添加标签
      if (route.parent_name) {
        originRoute.meta.parentName = route.parent_name
      } else {
        originRoute.meta.isParentRoute = true
      }
      return originRoute
    })
    // 保存返回路由树
    await store.dispatch('dynamicRoutes/asyncAddRoutes', await routeHandle(Routes))
    // 插入路由树
    store.getters['dynamicRoutes/getDynamicRoutes'].forEach(route => {
      router.addRoute(route)
    })
    router.replace(to.path)
  } else if (to.path === '/') {
    return next('/login/login')
  } else {
    return next()
  }
})

// 全局路由前置 （获取用户信息）
router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requireAuth)) {
    if (!store.state.userProfile.userData) {
      const {
        data: { data }
      } = await getProfile()
      await store.dispatch('userProfile/saveUserData', data)
      next()
    }
    next()
  } else {
    next()
  }
})

// 全局路由后置
router.afterEach(() => {
  // 停止NProgress加载
  NProgress.done()
})
