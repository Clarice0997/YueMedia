<template>
  <div ref="downloadRecordPieChart" id="downloadRecordPieChart" style="height: 400px; width: 100%"></div>
</template>

<script>
import { throttle } from 'lodash'
import store from '@/store'
import { getDownloadPieRecordAPI } from '@/apis/dataAPI'
import * as echarts from 'echarts'

export default {
  name: 'downloadRecordPieChart',
  data() {
    return {
      downloadRecordPieChartData: [],
      downloadRecordPieChartOption: {}
    }
  },
  mounted() {
    this.initDownloadRecordPieChart()
    this.resizeObserverCharts()
  },
  methods: {
    async initDownloadRecordPieChart() {
      const {
        data: { data }
      } = await getDownloadPieRecordAPI()
      this.downloadRecordPieChartData = data
      // Echart 初始化
      const downloadRecordPieChart = echarts.init(this.$refs.downloadRecordPieChart, 'macarons', { resize: true })
      this.downloadRecordPieChartOption = {
        title: {
          text: '下载类型统计饼图',
          left: 'center',
          textStyle: {
            fontSize: 20,
            fontWeight: 'bold'
          },
          padding: 10
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        grid: {
          bottom: '15%'
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '下载类型',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 1
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 12,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.downloadRecordPieChartData
          }
        ]
      }
      downloadRecordPieChart.setOption(this.downloadRecordPieChartOption, true)
      await store.dispatch('dataCharts/addEchart', {
        chartName: 'downloadRecordPieChart',
        chart: downloadRecordPieChart
      })
    },
    resizeObserverCharts() {
      const chartContainer = this.$refs.downloadRecordPieChart
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