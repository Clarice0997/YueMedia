import router from '@/router'
import VueRouter from 'vue-router'

/**
 * 构建路由树
 * @param {*} routes
 * @returns
 */
export const routeHandle = async routes => {
  // 父级路由
  const parentRoutes = routes.filter(route => {
    if (route.meta.isParentRoute) return route
  })
  // 子路由
  const childRoutes = routes.filter(route => {
    if (!route.meta.isParentRoute) return route
  })
  // 子路由插入父路由 children
  childRoutes.forEach(route => {
    parentRoutes.forEach(parent => {
      if (parent.name === route.meta.parentName) {
        parent.children.push(route)
      }
    })
  })
  return parentRoutes
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
