<template>
  <div style="width: 100%; display: flex; flex-direction: column">
    <div style="display: flex; width: 100%">
      <el-card shadow="hover" class="card">
        <downloadRecordLineChart></downloadRecordLineChart>
      </el-card>
      <el-card shadow="hover" class="card">
        <openApiRecordLineChart></openApiRecordLineChart>
      </el-card>
    </div>
    <div style="display: flex; width: 100%">
      <el-card shadow="hover" class="card">
        <downloadRecordPieChart></downloadRecordPieChart>
      </el-card>
      <el-card shadow="hover" class="card">
        <openApiRecordPieChart></openApiRecordPieChart>
      </el-card>
    </div>
    <div style="display: flex; width: 100%">
      <el-card shadow="hover" class="card">
        <sqlRecordLineChart></sqlRecordLineChart>
      </el-card>
      <el-card shadow="hover" class="card">
        <loginRecordChart></loginRecordChart>
      </el-card>
    </div>
  </div>
</template>

<script>
// import modules
import store from '@/store'

export default {
  name: 'adminAnalysis',
  data() {
    return {}
  },

  components: {
    loginRecordChart: () => import('@/components/analyse/loginRecordChart.vue'),
    openApiRecordLineChart: () => import('@/components/analyse/openApiRecordLineChart.vue'),
    downloadRecordPieChart: () => import('@/components/analyse/downloadRecordPieChart.vue'),
    openApiRecordPieChart: () => import('@/components/analyse/openApiRecordPieChart.vue'),
    downloadRecordLineChart: () => import('@/components/analyse/downloadRecordLineChart.vue'),
    sqlRecordLineChart: () => import('@/components/analyse/sqlRecordLineChart.vue')
  },

  beforeDestroy() {
    store.dispatch('dataCharts/clearEcharts')
  }
}
</script>

<style lang="less" scoped>
.card {
  margin: 10px;
  width: 50%;
  flex-grow: 1;
  height: 440px;
}
</style>