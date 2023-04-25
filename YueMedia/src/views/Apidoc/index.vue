<template>
  <el-card shadow="hover" class="body-card" :body-style="'height:100%'">
    <iframe :src="docUrl"></iframe>
  </el-card>
</template>

<script>
export default {
  name: 'MusicManageSystemApiServiceView',
  data() {
    return {
      docUrl: `${process.env.VUE_APP_REQUEST_URL}/apidoc`
    }
  }
}
</script>

<style lang="less" scoped>
.body-card {
  margin: 10px;
  flex-grow: 1;
  height: 100%;

  iframe {
    flex-grow: 1;
    width: 100%;
    height: 100%;
  }
}
</style>