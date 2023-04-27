<template>
  <el-dialog center :title="title" top="10vh" append-to-body :visible.sync="localDialogVideoPlayerVisible" width="70%" @close="closeVideoPlayerHandler">
    <vue-core-video-player preload="none" ref="videoPlayer" style="height: 70vh" :src="videoSource" :cover="cover" :title="title" :logo="targetIp + '/music.svg'" :autoplay="false" />
  </el-dialog>
</template>

<script>
export default {
  name: 'videoPlayer',
  props: {
    dialogVideoPlayerVisible: {
      type: Boolean,
      default: false,
      require: true
    },
    videoSource: {
      type: String,
      require: true
    },
    cover: {
      type: String,
      require: true
    },
    title: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      localDialogVideoPlayerVisible: this.dialogVideoPlayerVisible,
      targetIp: process.env.VUE_APP_REQUEST_URL
    }
  },
  watch: {
    dialogVideoPlayerVisible(newValue) {
      this.localDialogVideoPlayerVisible = newValue
    }
  },
  methods: {
    closeVideoPlayerHandler() {
      this.$refs.videoPlayer.pause()
      this.$emit('closeVideoPlayerHandler')
    }
  }
}
</script>

<style lang="less" scoped></style>