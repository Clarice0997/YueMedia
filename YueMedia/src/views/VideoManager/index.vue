<template>
  <div style="width: 100%">
    <!-- 顶部操作区卡片 -->
    <el-card shadow="hover" class="top-card">
      <div class="btns-container">
        <el-button type="success" icon="el-icon-plus" @click="clickInsertVideoHandler"> 新增视频</el-button>
        <el-button type="warning" icon="el-icon-takeaway-box" @click="clickDownloadBatchHandler">批量下载</el-button>
        <el-button type="danger" icon="el-icon-delete" @click="clickRemoveBatchHandler">批量删除</el-button>
      </div>
    </el-card>
    <el-card shadow="hover" class="body-card">
      <videoManagerTable ref="videoManagerTable"></videoManagerTable>
    </el-card>
    <uploadVideoDialog :dialog-insert-video-form-visible="dialogInsertVideoFormVisibleData" @hideInsertVideoDialogHandler="hideInsertVideoDialogHandler" @renewVideoTableDataHandler="renewVideoTableDataHandler"></uploadVideoDialog>
  </div>
</template>

<script>
export default {
  name: 'MusicManageSystemVideoManagerView',
  data() {
    return {
      dialogInsertVideoFormVisible: false
    }
  },
  components: {
    uploadVideoDialog: () => import('@/components/videoManager/uploadVideoDialog.vue'),
    videoManagerTable: () => import('@/components/videoManager/videoManagerTable.vue')
  },
  computed: {
    dialogInsertVideoFormVisibleData: {
      get() {
        return this.dialogInsertVideoFormVisible
      },
      set(value) {
        this.dialogInsertVideoFormVisible = value
      }
    }
  },
  methods: {
    clickInsertVideoHandler() {
      this.dialogInsertVideoFormVisible = true
    },
    clickDownloadBatchHandler() {
      this.$refs.videoManagerTable.downloadSelectedFile()
    },
    clickRemoveBatchHandler() {
      this.$refs.videoManagerTable.removeSelectedFile()
    },
    hideInsertVideoDialogHandler() {
      this.dialogInsertVideoFormVisibleData = false
    },
    renewVideoTableDataHandler() {
      this.$refs.videoManagerTable.initTableData()
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