<template>
  <div style="width: 100%; display: flex; flex-direction: column">
    <div style="display: flex; width: 100%">
      <el-card shadow="hover" class="card">
        <loginRecordChart></loginRecordChart>
      </el-card>
      <el-card shadow="hover" class="card">
        <div style="height: 400px; width: 100%; background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)"></div>
      </el-card>
    </div>
    <div style="display: flex; width: 100%">
      <el-card shadow="hover" class="card">
        <div style="height: 400px; width: 100%; background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)"></div>
      </el-card>
      <el-card shadow="hover" class="card">
        <div style="height: 400px; width: 100%; background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)"></div>
      </el-card>
    </div>
    <div style="display: flex; width: 100%">
      <el-card shadow="hover" class="card">
        <div style="height: 400px; width: 100%; background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)"></div>
      </el-card>
      <el-card shadow="hover" class="card">
        <div style="height: 400px; width: 100%; background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)"></div>
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
    loginRecordChart: () => import('@/components/analyse/loginRecordChart.vue')
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