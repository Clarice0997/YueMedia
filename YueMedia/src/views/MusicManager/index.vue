<template>
  <div style="width: 100%">
    <!-- 顶部操作区卡片 -->
    <el-card shadow="hover" class="top-card">
      <div class="btns-container">
        <el-button type="success" icon="el-icon-plus" @click="clickInsertMusicHandler"> 新增音频</el-button>
        <el-upload
          class="upload-batch"
          ref="upload-batch"
          multiple
          :before-upload="uploadMusicFileBatchBeforeHook"
          :on-progress="uploadMusicFileBatchProgressHook"
          :on-success="uploadMusicFileBatchSuccessHook"
          :on-error="uploadMusicFileBatchErrorHook"
          :limit="5"
          :on-exceed="uploadMusicFileBatchOnExceedHook"
          name="musicFile[]"
          with-credentials
          :headers="{ Authorization }"
          :show-file-list="false"
          :action="targetIp + '/apis/music/upload/music/batch'"
          style="margin-left: 0"
        >
          <el-button slot="trigger" type="success" icon="el-icon-takeaway-box">批量导入</el-button>
        </el-upload>
        <el-button type="warning" icon="el-icon-takeaway-box" @click="clickDownloadBatchHandler">批量下载</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="clickRemoveBatchHandler">批量删除</el-button>
      </div>
    </el-card>
    <el-card shadow="hover" class="body-card">
      <musicManagerTable ref="musicManagerTable"></musicManagerTable>
    </el-card>
    <uploadMusicDialog :dialog-insert-music-form-visible="dialogInsertMusicFormVisibleData" @renewTableHandler="renewTableHandler" @hideInsertMusicDialogHandler="hideInsertMusicDialogHandler"></uploadMusicDialog>
  </div>
</template>

<script>
import { getCookie } from '@/utils/cookie'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default {
  name: 'MusicManageSystemMusicManagerView',

  data() {
    return {
      dialogInsertMusicFormVisible: false,
      targetIp: process.env.VUE_APP_REQUEST_URL,
      loading: ''
    }
  },

  computed: {
    dialogInsertMusicFormVisibleData: {
      get() {
        return this.dialogInsertMusicFormVisible
      },
      set(value) {
        this.dialogInsertMusicFormVisible = value
      }
    },
    Authorization() {
      return getCookie('Access-Token')
    }
  },

  components: {
    // 懒加载组件
    uploadMusicDialog: () => import('@/components/musicManager/uploadMusicDialog.vue'),
    musicManagerTable: () => import('@/components/musicManager/musicManagerTable.vue')
  },

  methods: {
    clickInsertMusicHandler() {
      this.dialogInsertMusicFormVisible = true
    },
    hideInsertMusicDialogHandler() {
      this.dialogInsertMusicFormVisibleData = false
    },
    uploadMusicFileBatchBeforeHook(file) {
      const allowedMimetypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/aiff', 'audio/alac']
      let isAllowedMusic = allowedMimetypes.indexOf(file.type) !== -1
      const isLt100M = file.size / 1024 / 1024 < 100

      // 允许的后缀名
      const allowExtnames = ['ncm']
      if (!isAllowedMusic) {
        isAllowedMusic = allowExtnames.indexOf(file.name.split('.').pop()) !== -1
      }

      if (!isAllowedMusic) {
        this.$message.error('只能上传音乐文件（MP3/WAV/FLAC/NCM/AAC/OGG/AIFF/ALAC）')
        return false
      }

      if (!isLt100M) {
        this.$message.error('上传文件大小不能超过 100MB')
        return false
      }

      // 开启进度条
      if (isAllowedMusic && isLt100M) {
        NProgress.start()
        this.loading = this.openFullScreen('批量上传音频文件中...')
      }

      return isAllowedMusic && isLt100M
    },
    uploadMusicFileBatchOnExceedHook() {
      this.$message.warning('批量上传一次最多上传五个文件')
    },
    clickDownloadBatchHandler() {
      this.$refs.musicManagerTable.downloadSelectedFile()
    },
    clickRemoveBatchHandler() {
      this.$refs.musicManagerTable.removeSelectedFile()
    },
    uploadMusicFileBatchProgressHook() {},
    uploadMusicFileBatchSuccessHook(res) {
      // 刷新列表
      this.$refs.musicManagerTable.initTableData()
      this.$message.success(res.message)
      this.loading.close()
      NProgress.done()
    },
    uploadMusicFileBatchErrorHook(err) {
      this.$message.error(JSON.parse(err.message).message)
      this.loading.close()
      NProgress.done()
    },
    openFullScreen(text) {
      return this.$loading({
        lock: true,
        text: text ? text : 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    renewTableHandler() {
      // 刷新列表
      this.$refs.musicManagerTable.initTableData()
    }
  }
}
</script>

<style lang="less" scoped>
.top-card {
  .btns-container {
    display: flex;
    justify-content: center;

    button,
    div {
      margin-left: 10px;
    }
  }
}

.top-card,
.body-card {
  margin: 10px;
}

.body-card {
  margin-bottom: 30px;
}
</style>