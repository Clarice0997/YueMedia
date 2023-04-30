<template>
  <div style="height: 100%; width: 100%; display: flex; flex-direction: column">
    <el-card shadow="hover" class="body-card">
      <div slot="header" class="clearfix">
        <div style="display: flex; align-items: center; justify-content: space-between">
          <h1>处理文件任务列表</h1>
          <el-button icon="el-icon-refresh" type="primary" @click="refreshMyFileTable"></el-button>
        </div>
      </div>
      <myFileTable ref="myFileTable"></myFileTable>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MusicManageSystemMyFileView',
  components: {
    myFileTable: () => import('@/components/myFile/myFileTable.vue')
  },
  methods: {
    refreshMyFileTable() {
      this.$refs.myFileTable.renewTableData()
    }
  }
}
</script>

<style lang="less" scoped>
.body-card {
  margin: 10px;
  flex-grow: 1;
}
</style>