<template>
  <div style="width: 100%">
    <!-- 顶部操作区卡片 -->
    <el-card shadow="hover" class="top-card">
      <el-button type="success" icon="el-icon-plus" @click="clickInsertMusicHandler">新增歌曲</el-button>
      <el-button type="warning" icon="el-icon-takeaway-box">批量导出</el-button>
      <el-button type="danger" icon="el-icon-delete">批量删除</el-button>
    </el-card>
    <!-- 新增音乐对话框 -->
    <el-dialog title="新增歌曲" :visible.sync="dialogInsertMusicFormVisible" append-to-body>
      <el-form ref="insertMusicForm" :model="insertMusicForm" :rules="insertMusicFormRules" label-position="top">
        <!-- 上传音乐文件 -->
        <el-form-item label="上传音乐文件" prop="musicFile">
          <el-upload class="uploadMusic" :show-file-list="false" :on-success="uploadMusicFileSuccessHook" :limit="1" drag name="musicFile" with-credentials :headers="{ Authorization }" action="http://localhost:3000/apis/music/upload/music">
            <i class="el-icon-upload"></i>
          </el-upload>
        </el-form-item>
        <!-- 上传封面文件 -->
        <el-form-item label="上传封面文件" prop="coverFile">
          <div style="width: 148px; height: 148px; display: inline-block; border: 1px dashed #c0ccda; border-radius: 6px">
            <el-image :src="coverImage" style="width: 148px; height: 148px">
              <div slot="error" class="image-slot" style="width: 148px; height: 148px; display: flex; align-items: center; justify-content: center">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </div>
          <el-upload
            class="uploadMusicCover"
            :show-file-list="false"
            :on-success="uploadMusicCoverSuccessHook"
            :disabled="!isMusicUploaded"
            name="musicCoverFile"
            :data="updateMusicCover"
            with-credentials
            :headers="{ Authorization }"
            action="http://localhost:3000/apis/music/upload/music/cover"
            list-type="picture-card"
            style="float: right"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clickCloseInsertMusicDialogHandler">取 消</el-button>
        <el-button type="primary" :disabled="disabledInsertMusic" @click="clickConfirmInsertMusicHandler">确 定 </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCookie } from '@/utils/cookie'

export default {
  name: 'MusicManageSystemMusicManagerView',

  data() {
    return {
      dialogInsertMusicFormVisible: false,
      disabledInsertMusic: true,
      insertMusicForm: {},
      insertMusicFormRules: {},
      musicData: {},
      coverImage: '',
      isMusicUploaded: false,
      isMusicCoverExist: false,
      updateMusicCover: {}
    }
  },

  mounted() {},

  computed: {
    Authorization() {
      return getCookie('Access-Token')
    }
  },

  methods: {
    clickInsertMusicHandler() {
      this.dialogInsertMusicFormVisible = true
    },
    clickCloseInsertMusicDialogHandler() {
      this.dialogInsertMusicFormVisible = false
    },
    clickConfirmInsertMusicHandler() {},
    // 音乐文件上传成功回调
    uploadMusicFileSuccessHook({ coverName, musicName, meta, songId }) {
      // 文件已上传索引
      this.isMusicUploaded = true
      // 保存音乐元数据
      this.musicData = { ...meta, coverName, musicName, songId }
      // 成功上传通知
      this.$notify({
        title: '音乐文件已成功上传',
        type: 'success'
      })
      // 判断是否存在音乐封面
      if (coverName) {
        this.isMusicCoverExist = true
        this.coverImage = `${process.env.VUE_APP_REQUEST_URL}/tempCover/${coverName}?time=${Date.now()}`
        this.updateMusicCover = {
          musicName: musicName.split('.').shift(),
          originCoverName: coverName
        }
      } else {
        this.updateMusicCover = {
          musicName: musicName.split('.').shift()
        }
      }
    },
    // 音乐封面上传成功回调
    uploadMusicCoverSuccessHook({ message, picture }) {
      // 音乐封面成功上传通知
      this.$notify({
        title: message,
        type: 'success'
      })
      // 音乐封面上传索引
      this.isMusicCoverExist = true
      // 上传音乐封面显示
      this.coverImage = `${process.env.VUE_APP_REQUEST_URL}/tempCover/${picture}?time=${Date.now()}`
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
