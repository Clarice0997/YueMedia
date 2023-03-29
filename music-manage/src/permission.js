// import modules
import router from './router'
import { getCookie, setCookie } from '@/utils/cookie'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置Nprogress项 关闭右上角螺旋加载提示
NProgress.configure({ showSpinner: false })

// 全局路由前置
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

  // 判断跳转界面是否需要权限
  if (to.matched.some(record => record.meta.requireAuth)) {
    if (hasToken) {
      // 存在 Token 则放行，否则跳转登录页
      next()
      NProgress.done()
    } else {
      next('/login')
      NProgress.done()
    }
  } else if (to.path.includes('login')) {
    // 跳转登录页，判断是否已经登录
    // 登录则重定向首页，未登录则放行
    if (!hasToken) {
      next()
      NProgress.done()
    } else {
      next('/home')
      Message({
        message: '用户已登录，无需登录',
        type: 'warning',
        duration: 1500
      })
      NProgress.done()
    }
  }
})
// 如果路由地址不用校验则放行
// else {
//   next()
//   NProgress.done()
// }

// 全局路由后置
router.afterEach(() => {
  // 停止NProgress加载
  NProgress.done()
})
