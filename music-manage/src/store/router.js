// import modules
import router from '@/router'

export const dynamicRoutes = {
  namespaced: true,
  state: {
    staticRoutes: router.options.routes,
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
    },
    // 清空路由
    clearRoutes(state) {
      state.dynamicRoutes.length = 0
    }
  },
  actions: {
    // 异步添加路由
    asyncAddRoute({ commit }, route) {
      return new Promise(resolve => {
        setTimeout(() => {
          commit('addRoute', route)
          resolve()
        }, 200)
      })
    },
    // 异步批量添加路由
    asyncAddRoutes({ commit }, routes) {
      return new Promise(resolve => {
        setTimeout(() => {
          commit('addRoutes', routes)
          resolve()
        }, 200)
      })
    },
    // 异步清空路由
    asyncClearRoutes({ commit }) {
      return new Promise(resolve => {
        setTimeout(() => {
          commit('clearRoutes')
          resolve()
        }, 200)
      })
    }
  },
  getters: {
    // 获取动态路由配置
    getDynamicRoutes(state) {
      return state.dynamicRoutes
    },
    // 获取路由配置
    getRoutes(state) {
      return [...state.staticRoutes, ...state.dynamicRoutes]
    }
  }
}
