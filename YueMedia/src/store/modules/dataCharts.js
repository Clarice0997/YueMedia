export const dataCharts = {
  namespaced: true,
  state: {
    charts: {}
  },
  mutations: {
    // 添加 Echart 对象
    ADD_ECHART(state, { chartName, chart }) {
      state.charts[chartName] = chart
    },
    // 清空 Echart 对象
    CLEAR_ECHARTS(state) {
      state.charts = {}
    },
    // 重绘 Echart
    REDRAW_ECHARTS(state) {
      for (const chart in state.charts) {
        state.charts[chart].resize()
      }
    }
  },
  actions: {
    addEchart: ({ commit }, { chartName, chart }) => {
      commit('ADD_ECHART', { chartName, chart })
    },
    clearEcharts: ({ commit }) => {
      commit('CLEAR_ECHARTS')
    },
    redrawEcharts: ({ commit }) => {
      commit('REDRAW_ECHARTS')
    }
  }
}
