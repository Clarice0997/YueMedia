import Vue from 'vue'
import Vuex from 'vuex'
import { dynamicRoutes } from './modules/router'
import { userProfile } from './modules/userProfile'
import { dataCharts } from '@/store/modules/dataCharts'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    dynamicRoutes,
    userProfile,
    dataCharts
  }
})
