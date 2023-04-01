<template>
  <el-card shadow="hover" class="top-card">
    <div ref="loginRecordChart" id="loginRecordChart" style="height: 400px; width: 100%"></div>
  </el-card>
</template>

<script>
// import modules
// 必须采用 import * as 方式导入，否则 init 会报错
import * as echarts from 'echarts'
import { getLoginRecordAPI } from '@/apis/dataAPI'
import store from '@/store'
import { throttle } from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'MusicManageSystemHomePageView',

  data() {
    return {
      loginRecordChartOption: {},
      userRecordChartOption: {}
    }
  },

  computed: {
    ...mapState('dataCharts', ['charts'])
  },

  mounted() {
    this.initLoginRecordChart()
    this.resizeObserverCharts()
  },

  beforeDestroy() {
    store.dispatch('dataCharts/clearEcharts')
  },

  methods: {
    async initLoginRecordChart() {
      try {
        const {
          data: { data }
        } = await getLoginRecordAPI()
        // 解构键值
        const dates = Object.keys(data)
        const counts = Object.values(data)
        // 渲染 Echart 图标
        const loginChart = echarts.init(this.$refs.loginRecordChart, 'macarons', { resize: true })
        this.loginRecordChartOption = {
          title: {
            text: '用户登录趋势表',
            left: 'center',
            subtext: '数据来源：MongoDB',
            textStyle: {
              fontSize: 20,
              fontWeight: 'bold'
            },
            padding: 10
          },
          tooltip: {
            trigger: 'axis'
          },
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#a1c4fd' },
            { offset: 1, color: '#c2e9fb' }
          ]),
          xAxis: {
            type: 'category',
            data: dates
          },
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: '登录次数',
              type: 'bar',
              data: counts,
              itemStyle: {
                opacity: 0.5
              }
            },
            {
              name: '趋势',
              type: 'line',
              data: counts
            }
          ]
        }
        loginChart.setOption(this.loginRecordChartOption, true)
        store.dispatch('dataCharts/addEchart', { chartName: 'loginChart', chart: loginChart })
      } catch (e) {
        // 异常处理
        console.log(e.message)
        if (e.response) {
          this.$message({
            message: e.response.data.message,
            type: 'error',
            duration: 2000
          })
        }
      }
    },
    resizeObserverCharts() {
      const chartContainer = this.$refs.loginRecordChart
      const resizeObserver = new ResizeObserver(
        throttle(() => {
          store.dispatch('dataCharts/redrawEcharts')
        }, 1000)
      )
      resizeObserver.observe(chartContainer)
    }
  }
}
</script>

<style lang="less" scoped>
.top-card {
  margin: 10px;
  flex-grow: 1;
}
</style>
