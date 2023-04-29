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
  </div>
</template>

<script>
// import modules
import store from '@/store'

export default {
  name: 'userAnalysis',
  data() {
    return {}
  },

  mounted() {},

  components: {
    openApiRecordLineChart: () => import('@/components/analyse/openApiRecordLineChart.vue'),
    downloadRecordPieChart: () => import('@/components/analyse/downloadRecordPieChart.vue'),
    openApiRecordPieChart: () => import('@/components/analyse/openApiRecordPieChart.vue'),
    downloadRecordLineChart: () => import('@/components/analyse/downloadRecordLineChart.vue')
  },

  beforeDestroy() {
    store.dispatch('dataCharts/clearEcharts')
  },

  methods: {}
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