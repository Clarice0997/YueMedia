<template>
  <div style="height: 100%; width: 100%; display: flex; flex-direction: column">
    <el-card shadow="hover" class="body-card">
      <div slot="header" class="clearfix">
        <h1>处理文件任务列表</h1>
      </div>
      <myFileTable></myFileTable>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MusicManageSystemMyFileView',
  components: {
    myFileTable: () => import('@/components/myFile/myFileTable.vue')
  }
}
</script>

<style lang="less" scoped>
.body-card {
  margin: 10px;
  flex-grow: 1;
}
</style>