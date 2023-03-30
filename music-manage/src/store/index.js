import Vue from 'vue'
import Vuex from 'vuex'
import { dynamicRoutes } from './router'
import { userProfile } from './userProfile'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    dynamicRoutes,
    userProfile
  }
})
