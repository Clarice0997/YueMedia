/**
 * 构建路由树
 * @param {*} routes
 * @returns
 */
export const routeParser = async routes => {
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
