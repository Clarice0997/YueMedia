// 保存用户对象
const saveUserData = ({ commit }, data) => {
  commit('SET_USER_DATA', data)
}

// 清除用户对象
const clearUserData = ({ commit }) => {
  commit('CLEAR_USER_DATA')
}

export const userProfile = {
  namespaced: true,
  state: {
    userData: undefined
  },
  mutations: {
    SET_USER_DATA(state, data) {
      state.userData = data
    },
    CLEAR_USER_DATA(state) {
      state.userData = null
    }
  },
  actions: {
    saveUserData,
    clearUserData
  }
}
