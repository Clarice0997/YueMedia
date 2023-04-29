<template>
  <div ref="downloadRecordLineChart" id="downloadRecordLineChart" style="height: 400px; width: 100%"></div>
</template>

<script>
import { getDownloadLineRecordAPI } from '@/apis/dataAPI'
import * as echarts from 'echarts'
import store from '@/store'
import { throttle } from 'lodash'

export default {
  name: 'downloadRecordLineChart',
  data() {
    return {
      downloadRecordLineChartData: [],
      downloadRecordLineChartOption: {}
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
        } = await getDownloadLineRecordAPI()
        this.downloadRecordLineChartData = result
        // Echart 初始化
        const downloadRecordLineChart = echarts.init(this.$refs.downloadRecordLineChart, 'macarons', { resize: true })
        this.downloadRecordLineChartOption = {
          title: {
            text: '文件下载情况表',
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
            data: ['下载次数'],
            left: 'center',
            top: 40
          },
          xAxis: {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            data: this.downloadRecordLineChartData.map(data => data.date)
          },
          yAxis: [
            {
              type: 'value',
              name: '下载次数',
              axisLabel: {
                formatter: '{value} 次'
              }
            }
            // {
            //   type: 'value',
            //   name: '平均下载时间（秒）',
            //   axisLabel: {
            //     formatter: '{value} MS'
            //   },
            //   splitLine: { show: false },
            //   axisLine: { show: false },
            //   axisTick: { show: false }
            // }
          ],
          series: [
            {
              name: '下载次数',
              type: 'bar',
              data: this.downloadRecordLineChartData.map(data => data.count),
              itemStyle: {
                opacity: 0.5
              },
              yAxisIndex: 0,
              silent: this.downloadRecordLineChartData.map(data => data.count).length === 0
            }
            // {
            //   name: '平均下载时间（秒）',
            //   type: 'line',
            //   data: this.downloadRecordLineChartData.map(data => data.averageDuration),
            //   yAxisIndex: 1,
            //   silent: this.downloadRecordLineChartData.map(data => data.averageDuration).length === 0
            // }
          ]
        }
        downloadRecordLineChart.setOption(this.downloadRecordLineChartOption, true)
        await store.dispatch('dataCharts/addEchart', {
          chartName: 'downloadRecordLineChart',
          chart: downloadRecordLineChart
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
      const chartContainer = this.$refs.downloadRecordLineChart
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