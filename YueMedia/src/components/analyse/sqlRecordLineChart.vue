<template>
  <div ref="sqlRecordLineChart" id="sqlRecordLineChart" style="height: 400px; width: 100%"></div>
</template>

<script>
import { getSqlLineRecordAPI } from '@/apis/dataAPI'
import * as echarts from 'echarts'
import store from '@/store'
import { throttle } from 'lodash'

export default {
  name: 'sqlRecordLineChart',
  data() {
    return {
      sqlLineChartData: [],
      sqlLineChartOption: {}
    }
  },
  mounted() {
    this.initSqlRecordLineChart()
    this.resizeObserverCharts()
  },

  methods: {
    async initSqlRecordLineChart() {
      try {
        const {
          data: { result }
        } = await getSqlLineRecordAPI()
        this.sqlLineChartData = result
        // Echart 初始化
        const sqlRecordLineChart = echarts.init(this.$refs.sqlRecordLineChart, 'macarons', { resize: true })
        this.sqlLineChartOption = {
          title: {
            text: 'SQL 语句响应情况表',
            left: 'center',
            textStyle: {
              fontSize: 20,
              fontWeight: 'bold'
            },
            padding: 10
          },
          grid: {
            top: '20%'
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
              start: 0,
              end: 100
            }
          ],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#a1c4fd' },
            { offset: 1, color: '#c2e9fb' }
          ]),
          legend: {
            data: ['请求次数', '平均响应时间（毫秒）'],
            left: 'center',
            top: 40
          },
          xAxis: {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            data: this.sqlLineChartData.map(data => data.date)
          },
          yAxis: [
            {
              type: 'value',
              name: '请求次数',
              axisLabel: {
                formatter: '{value} 次'
              }
            },
            {
              type: 'value',
              name: '平均响应时间（毫秒）',
              axisLabel: {
                formatter: '{value} MS'
              },
              splitLine: { show: false },
              axisLine: { show: false },
              axisTick: { show: false }
            }
          ],
          series: [
            {
              name: '请求次数',
              type: 'bar',
              data: this.sqlLineChartData.map(data => data.count),
              itemStyle: {
                opacity: 0.5
              },
              yAxisIndex: 0,
              silent: this.sqlLineChartData.map(data => data.count).length === 0
            },
            {
              name: '平均响应时间（毫秒）',
              type: 'line',
              data: this.sqlLineChartData.map(data => data.averageResponseTime),
              yAxisIndex: 1,
              silent: this.sqlLineChartData.map(data => data.averageResponseTime).length === 0
            }
          ]
        }
        sqlRecordLineChart.setOption(this.sqlLineChartOption, true)
        await store.dispatch('dataCharts/addEchart', {
          chartName: 'sqlRecordLineChart',
          chart: sqlRecordLineChart
        })
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
      const chartContainer = this.$refs.sqlRecordLineChart
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