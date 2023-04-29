<template>
  <div ref="openApiRecordLineChart" id="openApiRecordLineChart" style="height: 400px; width: 100%"></div>
</template>

<script>
import { getOpenApiLineRecordAPI } from '@/apis/dataAPI'
import * as echarts from 'echarts'
import store from '@/store'
import { throttle } from 'lodash'

export default {
  name: 'openApiRecordLineChart',
  data() {
    return {
      openApiLineChartData: [],
      openApiLineChartOption: {}
    }
  },
  mounted() {
    this.initOpenApiRecordLineChart()
    this.resizeObserverCharts()
  },

  methods: {
    async initOpenApiRecordLineChart() {
      try {
        const {
          data: { result }
        } = await getOpenApiLineRecordAPI()
        this.openApiLineChartData = result
        // Echart 初始化
        const openApiRecordLineChart = echarts.init(this.$refs.openApiRecordLineChart, 'macarons', { resize: true })
        this.openApiLineChartOption = {
          title: {
            text: 'Open API 调用情况表',
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
            data: ['调用次数', '平均响应时间（毫秒）'],
            left: 'center',
            top: 40
          },
          xAxis: {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            data: this.openApiLineChartData.map(data => data.date)
          },
          yAxis: [
            {
              type: 'value',
              name: '调用次数',
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
              name: '调用次数',
              type: 'bar',
              data: this.openApiLineChartData.map(data => data.count),
              itemStyle: {
                opacity: 0.5
              },
              yAxisIndex: 0,
              silent: this.openApiLineChartData.map(data => data.count).length === 0
            },
            {
              name: '平均响应时间（毫秒）',
              type: 'line',
              data: this.openApiLineChartData.map(data => data.averageDuration),
              yAxisIndex: 1,
              silent: this.openApiLineChartData.map(data => data.averageDuration).length === 0
            }
          ]
        }
        openApiRecordLineChart.setOption(this.openApiLineChartOption, true)
        await store.dispatch('dataCharts/addEchart', {
          chartName: 'openApiRecordLineChart',
          chart: openApiRecordLineChart
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
      const chartContainer = this.$refs.openApiRecordLineChart
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