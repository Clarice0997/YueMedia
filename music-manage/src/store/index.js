import Vue from 'vue'
import Vuex from 'vuex'
import { dynamicRoutes } from './router'
import { userProfile } from './userProfile'
import { dataCharts } from '@/store/dataCharts'

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
