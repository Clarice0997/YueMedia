export const router = {
  namespaced: true,
  state: {
    dynamicRoutes: []
  },
  mutations: {
    // 添加路由
    addRoute(state, route) {
      state.dynamicRoutes.push(route)
    },
    // 批量添加路由
    addRoutes(state, routes) {
      state.dynamicRoutes = state.dynamicRoutes.concat(routes)
    }
  },
  actions: {
    // 异步添加路由
    asyncAddRoute({ commit }, route) {
      return new Promise(resolve => {
        setTimeout(() => {
          commit('addRoute', route)
          resolve()
        }, 1000)
      })
    },
    // 异步批量添加路由
    asyncAddRoutes({ commit }, routes) {
      return new Promise(resolve => {
        setTimeout(() => {
          commit('addRoutes', routes)
          resolve()
        }, 1000)
      })
    }
  },
  getters: {
    // 获取动态路由配置
    getDynamicRoutes(state) {
      return state.dynamicRoutes
    }
  }
}
