<template>
  <div ref="openApiRecordPieChart" id="openApiRecordPieChart" style="height: 400px; width: 100%"></div>
</template>

<script>
import { throttle } from 'lodash'
import store from '@/store'
import { getOpenApiPieRecordAPI } from '@/apis/dataAPI'
import * as echarts from 'echarts'

export default {
  name: 'openApiRecordPieChart',
  data() {
    return {
      openApiRecordPieChartData: [],
      openApiRecordPieChartOption: {}
    }
  },
  mounted() {
    this.initOpenApiRecordPieChart()
    this.resizeObserverCharts()
  },
  methods: {
    async initOpenApiRecordPieChart() {
      const {
        data: { data }
      } = await getOpenApiPieRecordAPI()
      this.openApiRecordPieChartData = data
      // Echart 初始化
      const openApiRecordPieChart = echarts.init(this.$refs.openApiRecordPieChart, 'macarons', { resize: true })
      this.openApiRecordPieChartOption = {
        title: {
          text: 'Open API 调用类型统计表',
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
            name: '调用类型',
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
            data: this.openApiRecordPieChartData
          }
        ]
      }
      openApiRecordPieChart.setOption(this.openApiRecordPieChartOption, true)
      await store.dispatch('dataCharts/addEchart', {
        chartName: 'openApiRecordPieChart',
        chart: openApiRecordPieChart
      })
    },
    resizeObserverCharts() {
      const chartContainer = this.$refs.openApiRecordPieChart
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