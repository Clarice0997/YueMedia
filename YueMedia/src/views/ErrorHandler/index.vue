<template>
  <div style="height: 100%; width: 100%; display: flex; flex-direction: column">
    <el-card shadow="hover" class="body-card" body-style="height:100%">
      <div slot="header" class="clearfix">
        <h1>未处理错误表格</h1>
      </div>
      <unhandledErrorTable ref="unhandledErrorTable" @renewTableData="renewTableData"></unhandledErrorTable>
    </el-card>
    <el-card shadow="hover" class="body-card" style="margin-top: 0" body-style="height:100%">
      <div slot="header" class="clearfix">
        <h1 style="color: #ff5722">标记错误表格</h1>
      </div>
      <targetErrorTable ref="targetErrorTable" @renewTableData="renewTableData"></targetErrorTable>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MusicManageSystemErrorHandlerView',
  components: {
    targetErrorTable: () => import('@/components/errorHandler/targetedErrorTable.vue'),
    unhandledErrorTable: () => import('@/components/errorHandler/unhandledErrorTable.vue')
  },
  methods: {
    renewTableData() {
      this.$refs.targetErrorTable.initTableData()
      this.$refs.unhandledErrorTable.initTableData()
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