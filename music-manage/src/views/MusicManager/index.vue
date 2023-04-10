<template>
  <div style="width: 100%">
    <!-- 顶部操作区卡片 -->
    <el-card shadow="hover" class="top-card">
      <el-button type="success" icon="el-icon-plus" @click="clickInsertMusicHandler">新增歌曲</el-button>
      <el-button type="success" icon="el-icon-takeaway-box">批量导入</el-button>
      <el-button type="warning" icon="el-icon-takeaway-box">批量导出</el-button>
      <el-button type="danger" icon="el-icon-delete">批量删除</el-button>
    </el-card>
    <uploadMusicDialog :dialog-insert-music-form-visible="dialogInsertMusicFormVisible" @hideInsertMusicDialogHandler="hideInsertMusicDialogHandler"></uploadMusicDialog>
  </div>
</template>

<script>
export default {
  name: 'MusicManageSystemMusicManagerView',

  data() {
    return {
      dialogInsertMusicFormVisible: false
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
    }
  },

  mounted() {},

  components: {
    // 懒加载组件
    uploadMusicDialog: () => import('@/components/musicManager/uploadMusicDialog.vue')
  },

  methods: {
    clickInsertMusicHandler() {
      this.dialogInsertMusicFormVisible = true
    },
    hideInsertMusicDialogHandler() {
      console.log(1)
      this.dialogInsertMusicFormVisibleData = false
    }
  }
}
</script>

<style lang="less" scoped>
.top-card {
  .el-input {
    width: 200px;
  }

  .el-input {
    margin-right: 20px;
  }
}

.top-card,
.body-card {
  margin: 10px;
}
</style>
