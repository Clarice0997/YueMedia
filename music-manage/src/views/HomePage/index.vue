<template>
  <el-card shadow="hover" class="top-card">
    <div ref="loginRecordChart" id="loginRecordChart" style="height: 400px; width: 100%"></div>
    <div ref="userRecordChart" id="userRecordChart" style="height: 400px; width: 100%"></div>
  </el-card>
</template>

<script>
// import modules
// 必须采用 import * as 方式导入，否则 init 会报错
import * as echarts from 'echarts'
import { getLoginRecordAPI } from '@/apis/dataAPI'

export default {
  name: 'MusicManageSystemHomePageView',

  data() {
    return {
      loginChart: {},
      loginRecordChartOption: {},
      userRecordChartOption: {}
    }
  },

  mounted() {
    this.initLoginRecordChart()
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
        this.loginChart = echarts.init(this.$refs.loginRecordChart, 'macarons')
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
        this.loginChart.setOption(this.loginRecordChartOption, true)
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
    redrawChart() {
      // TODO: 自适应重绘 Echart（未成功）
      this.$nextTick(() => {
        this.loginChart.resize()
      })
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
