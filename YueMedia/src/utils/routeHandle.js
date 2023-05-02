import router from '@/router'
import VueRouter from 'vue-router'

/**
 * 构建路由树 （递归实现，多级适配）
 * @param {Array} routes
 * @param {String} parentName
 * @returns {Array}
 */
export const routeHandle = (routes, parentName) => {
  const result = []
  routes.forEach(route => {
    if (route.meta.parentName === parentName) {
      const children = routeHandle(routes, route.name)
      if (children.length) {
        route.children = children
      }
      result.push(route)
    }
  })
  return result
}

/**
 * 重置路由对象
 * @returns
 */
export const resetRouter = async () => {
  // 获取初始路由
  const initialRoutes = router.options.routes
  // 构建初始路由对象
  const newRouter = new VueRouter({
    routes: initialRoutes
  })
  router.matcher = newRouter.matcher
}
