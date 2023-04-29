<template>
  <div style="width: 100%; display: flex; flex-direction: column; min-width: 1400px">
    <div style="width: 100%">
      <el-card shadow="hover" class="top-card" body-style="height:100%;width:100%">
        <div style="width: 100%; display: flex" class="top-card-container">
          <!--  音频数  -->
          <div style="margin-left: 0" class="music-data data-container" @click="clickMusicHandler">
            <div class="data-text">
              <h2>音频管理</h2>
              <h1>{{ musicNum }}</h1>
            </div>
            <div class="data-chart">
              <div class="chart" style="width: 100%" ref="musicPieChart" id="musicPieChart"></div>
            </div>
          </div>
          <!--  视频数  -->
          <div class="video-data data-container" @click="clickVideoHandler">
            <div class="data-text">
              <h2>视频管理</h2>
              <h1>{{ videoNum }}</h1>
            </div>
            <div class="data-chart">
              <div class="chart" style="width: 100%" ref="videoPieChart" id="videoPieChart"></div>
            </div>
          </div>
          <!--  已处理任务数 任务类型  -->
          <div class="task-data data-container" @click="clickTaskHandler">
            <div class="data-text">
              <h2>任务总数</h2>
              <h1>{{ taskNum }}</h1>
            </div>
            <div class="data-chart">
              <div class="chart" style="width: 100%" ref="taskPieChart" id="taskPieChart"></div>
            </div>
          </div>
          <!--  存储容量  -->
          <div class="storage-data data-container" style="margin-right: 0; cursor: default">
            <div class="data-text">
              <h2>存储使用</h2>
              <h1>{{ storage }}</h1>
            </div>
            <div class="data-chart">
              <div class="chart" style="width: 100%; cursor: default" ref="storagePieChart" id="storagePieChart"></div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <div style="width: 100%; display: flex">
      <el-card shadow="hover" class="chart-card" body-style="height:100%;width:100%">
        <div class="chart-container">
          <div class="openApiLineChart-container">
            <div class="chart" ref="openApiLineChart" id="openApiLineChart" style="width: 100%"></div>
          </div>
          <!--          <div class="openApiPieChart-container">-->
          <!--            <div class="chart" ref="openApiPieChart" id="openApiPieChart" style="width: 100%"></div>-->
          <!--          </div>-->
        </div>
      </el-card>
      <el-card shadow="hover" class="task-card" body-style="height:100%;width:100%">
        <myFileTable></myFileTable>
      </el-card>
    </div>
  </div>
</template>

<script>
// import modules
import * as echarts from 'echarts'
import store from '@/store'
import { throttle } from 'lodash'
import { getUserTotalDataAPI } from '@/apis/dataAPI'

export default {
  name: 'MusicManageSystemHomePageView',

  data() {
    return {
      musicNum: 0,
      videoNum: 0,
      storage: '',
      taskNum: 0,
      musicStatistics: [],
      videoStatistics: [],
      taskStatistics: [],
      storageStatistics: [],
      openApiLineChartData: [],
      openApiPieChartData: [],
      musicPieChartOption: {},
      videoPieChartOption: {},
      taskPieChartOption: {},
      storagePieChartOption: {},
      openApiLineChartOption: {},
      openApiPieChartOption: {}
    }
  },

  async mounted() {
    await this.getUserTotalData()
    this.resizeObserverCharts()
  },

  beforeDestroy() {
    store.dispatch('dataCharts/clearEcharts')
  },

  components: {
    myFileTable: () => import('@/components/homePage/myFileTable.vue')
  },

  methods: {
    async getUserTotalData() {
      getUserTotalDataAPI()
        .then(({ data: { data } }) => {
          this.musicNum = data.music.count
          this.musicStatistics = data.music.musicStatistics
          this.videoNum = data.video.count
          this.videoStatistics = data.video.videoStatistics
          this.taskNum = data.task.count
          this.taskStatistics = data.task.taskStatistics
          this.storage = data.storage.storage
          this.storageStatistics = data.storage.storageStatistics
          this.openApiLineChartData = data.openApi.lineData
        })
        .catch(error => {
          this.$message.error(error.response.data.message)
        })
        .finally(async () => {
          await this.initMusicPieChart()
          await this.initVideoPieChart()
          await this.initTaskPieChart()
          await this.initStoragePieChart()
          await this.initOpenApiLineChart()
        })
    },
    async initMusicPieChart() {
      // Echart 初始化
      const musicPieChart = echarts.init(this.$refs.musicPieChart, 'macarons', { resize: true })
      this.musicPieChartOption = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '音频编码格式',
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
            data: this.musicStatistics
          }
        ]
      }
      musicPieChart.setOption(this.musicPieChartOption, true)
      await store.dispatch('dataCharts/addEchart', { chartName: 'musicPieChart', chart: musicPieChart })
    },
    async initVideoPieChart() {
      // Echart 初始化
      const videoPieChart = echarts.init(this.$refs.videoPieChart, 'macarons', { resize: true })
      this.videoPieChartOption = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '视频编码格式',
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
            data: this.videoStatistics
          }
        ]
      }
      videoPieChart.setOption(this.videoPieChartOption, true)
      await store.dispatch('dataCharts/addEchart', { chartName: 'videoPieChart', chart: videoPieChart })
    },
    async initTaskPieChart() {
      // Echart 初始化
      const taskPieChart = echarts.init(this.$refs.taskPieChart, 'macarons', { resize: true })
      this.taskPieChartOption = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: '任务类型',
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
            data: this.taskStatistics
          }
        ]
      }
      taskPieChart.setOption(this.taskPieChartOption, true)
      await store.dispatch('dataCharts/addEchart', { chartName: 'taskPieChart', chart: taskPieChart })
    },
    async initStoragePieChart() {
      // Echart 初始化
      const storagePieChart = echarts.init(this.$refs.storagePieChart, 'macarons', { resize: true })
      this.storagePieChartOption = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            if (params.value / 1024 / 1024 >= 1024) {
              return `${(params.data.value / 1024 / 1024 / 1024).toFixed(2)} GB <br> ${params.name}: ${params.percent} %`
            } else {
              return `${(params.data.value / 1024 / 1024).toFixed(2)} MB <br> ${params.name}: ${params.percent} %`
            }
          }
        },
        series: [
          {
            name: '存储空间',
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
            data: this.storageStatistics
          }
        ]
      }
      storagePieChart.setOption(this.storagePieChartOption, true)
      await store.dispatch('dataCharts/addEchart', { chartName: 'storagePieChart', chart: storagePieChart })
    },
    async initOpenApiLineChart() {
      // Echart 初始化
      const openApiLineChart = echarts.init(this.$refs.openApiLineChart, 'macarons', { resize: true })
      this.openApiLineChartOption = {
        title: {
          text: 'Open API 调用情况',
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
      openApiLineChart.setOption(this.openApiLineChartOption, true)
      await store.dispatch('dataCharts/addEchart', { chartName: 'openApiLineChart', chart: openApiLineChart })
    },
    async initOpenApiPieChart() {
      // Echart 初始化
      const openApiPieChart = echarts.init(this.$refs.openApiPieChart, 'macarons', { resize: true })
      this.openApiPieChartOption = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            if (params.value / 1024 / 1024 >= 1024) {
              return `${(params.data.value / 1024 / 1024 / 1024).toFixed(2)} GB <br> ${params.name}: ${params.percent} %`
            } else {
              return `${(params.data.value / 1024 / 1024).toFixed(2)} MB <br> ${params.name}: ${params.percent} %`
            }
          }
        },
        series: [
          {
            name: 'Open API 调用类型',
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
            data: this.openApiPieChartData
          }
        ]
      }
      openApiPieChart.setOption(this.openApiPieChartOption, true)
      await store.dispatch('dataCharts/addEchart', { chartName: 'openApiPieChart', chart: openApiPieChart })
    },
    clickMusicHandler() {
      this.$router.replace('/home/music-manager')
    },
    clickVideoHandler() {
      this.$router.replace('/home/video-manager')
    },
    clickTaskHandler() {
      this.$router.replace('/home/my-file')
    },
    resizeObserverCharts() {
      const chartContainer = this.$refs.musicPieChart
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

<style lang="less" scoped>
.top-card {
  margin: 10px;
  flex-grow: 1;
  min-height: 300px;
  height: 300px;
}

.chart-card {
  margin: 0 0 10px 10px;
  width: 60%;
  min-height: 500px;
  display: flex;
}

.task-card {
  margin: 0 10px 10px 10px;
  width: 40%;
  min-height: 500px;
}

.top-card-container {
  display: flex;
  height: 100%;
}

.data-container {
  display: flex;
  width: 25%;
  margin: 10px;
  background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
  border-radius: 10px;
  padding: 5px;
  transition: 0.2s;
  cursor: pointer;

  .data-text {
    width: 30%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    h1 {
      font-size: 32px;
      color: whitesmoke;
      font-weight: normal;
    }

    h2 {
      margin-bottom: 12px;
      font-size: 24px;
      color: whitesmoke;
      font-weight: normal;
    }
  }

  .data-chart {
    width: 70%;

    .chart {
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }
}

.data-container:hover {
  opacity: 0.8;
}

.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;

  .openApiLineChart-container {
    width: 100%;
    height: 100%;
  }

  //.openApiPieChart-container {
  //  width: 38%;
  //  height: 100%;
  //}
}

#openApiLineChart {
  width: 100%;
  height: 100%;
}

//#openApiPieChart {
//  width: 100%;
//  height: 100%;
//}
</style>