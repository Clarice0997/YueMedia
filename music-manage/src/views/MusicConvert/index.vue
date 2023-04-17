<template>
  <el-card shadow="hover" class="body-card">
    <musicConverter></musicConverter>
  </el-card>
</template>

<script>
export default {
  name: 'MusicManageSystemMusicConvertView',
  components: {
    musicConverter: () => import('@/components/musicConvert/musicConverter.vue')
  }
}
</script>

<style lang="less" scoped>
.body-card {
  margin: 10px;
  flex-grow: 1;
}
</style>