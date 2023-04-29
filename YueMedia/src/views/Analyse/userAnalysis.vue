<template>
  <div style="width: 100%; display: flex; flex-direction: column">
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
  name: 'userAnalysis',
  data() {
    return {}
  },

  mounted() {
    this.initLoginRecordChart()
    this.resizeObserverCharts()
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