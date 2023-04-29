<template>
  <div ref="loginRecordChart" id="loginRecordChart" style="height: 400px; width: 100%"></div>
</template>

<script>
import { getLoginRecordAPI } from '@/apis/dataAPI'
import * as echarts from 'echarts'
import store from '@/store'
import { throttle } from 'lodash'

export default {
  name: 'loginRecordChart',
  data() {
    return {
      loginRecordChartOption: {}
    }
  },
  mounted() {
    this.initLoginRecordChart()
    this.resizeObserverCharts()
  },

  methods: {
    async initLoginRecordChart() {
      try {
        const {
          data: { data }
        } = await getLoginRecordAPI()
        // 解构键值
        const dates = data.map(item => item.date)
        const counts = data.map(item => item.count)
        // 渲染 Echart 图标
        const loginChart = echarts.init(this.$refs.loginRecordChart, 'macarons', { resize: true })
        this.loginRecordChartOption = {
          title: {
            text: '用户登录趋势表',
            left: 'center',
            subtext: '数据来源：所有用户登录记录',
            textStyle: {
              fontSize: 20,
              fontWeight: 'bold'
            },
            padding: 10
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              crossStyle: {
                color: '#999'
              }
            }
          },
          toolbox: {
            feature: {
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['line', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          dataZoom: [
            {
              type: 'slider',
              start: 50,
              end: 100
            }
          ],
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
        await store.dispatch('dataCharts/addEchart', { chartName: 'loginChart', chart: loginChart })
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
        }, 500)
      )
      resizeObserver.observe(chartContainer)
    }
  }
}
</script>

<style lang="less" scoped></style>