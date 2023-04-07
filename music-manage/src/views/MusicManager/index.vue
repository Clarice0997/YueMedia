<template>
  <div style="width: 100%">
    <!-- 顶部操作区卡片 -->
    <el-card shadow="hover" class="top-card">
      <el-button type="success" icon="el-icon-plus" @click="clickInsertMusicHandler">新增歌曲</el-button>
      <el-button type="success" icon="el-icon-takeaway-box">批量导入</el-button>
      <el-button type="warning" icon="el-icon-takeaway-box">批量导出</el-button>
      <el-button type="danger" icon="el-icon-delete">批量删除</el-button>
    </el-card>
    <!-- 新增音乐对话框 -->
    <el-dialog title="新增歌曲" :visible.sync="dialogInsertMusicFormVisible" append-to-body @close="resetUploadMusicForm">
      <el-form ref="insertMusicForm" :model="insertMusicForm" :rules="insertMusicFormRules" label-position="top">
        <!-- 上传音乐文件 -->
        <!-- TODO: 上传文件类型限定 -->
        <el-form-item label="上传音乐文件" prop="musicFile">
          <el-upload class="uploadMusic" ref="uploadMusic" :disabled="isMusicUploaded" :on-success="uploadMusicFileSuccessHook" :limit="1" drag name="musicFile" with-credentials :headers="{ Authorization }" action="http://localhost:3000/apis/music/upload/music">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip" style="margin: 0">音乐文件大小不超过 100 MB</div>
          </el-upload>
        </el-form-item>
        <!-- 上传封面文件 -->
        <!-- TODO: 上传文件类型限定 -->
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
            ref="uploadCover"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <!-- 歌曲名称 -->
        <el-form-item label="歌曲名称" prop="songName">
          <el-input v-model="insertMusicForm.songName" placeholder="输入歌曲名称" clearable :disabled="!isMusicUploaded"></el-input>
        </el-form-item>
        <!-- 歌手名 -->
        <el-form-item label="歌手名" prop="singerName">
          <el-input v-model="insertMusicForm.singerName" placeholder="输入歌手名" clearable :disabled="!isMusicUploaded"></el-input>
        </el-form-item>
        <!-- 专辑名 -->
        <el-form-item label="专辑名" prop="albumName">
          <el-input v-model="insertMusicForm.albumName" placeholder="输入歌曲专辑名" clearable :disabled="!isMusicUploaded"></el-input>
        </el-form-item>
        <!-- 歌曲年份 -->
        <el-form-item label="歌曲年份" prop="year">
          <el-date-picker v-model="insertMusicForm.year" type="year" format="yyyy" value-format="timestamp" :disabled="!isMusicUploaded" placeholder="选择歌曲年份"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clickCloseInsertMusicDialogHandler">取 消</el-button>
        <el-button type="warning" :disabled="!isMusicUploaded">重 置</el-button>
        <el-button type="primary" :disabled="!isMusicUploaded" v-loading.fullscreen="fullscreenLoading" :loading="uploadBtnLoading" @click="clickConfirmInsertMusicHandler">确 定 </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getCookie } from '@/utils/cookie'
import { UploadMusicDataAPI } from '@/apis/musicAPI'

export default {
  name: 'MusicManageSystemMusicManagerView',

  data() {
    return {
      dialogInsertMusicFormVisible: false,
      insertMusicForm: {
        musicFile: false,
        coverFile: false,
        songId: '',
        songName: '',
        songSize: 0,
        musicCodec: '',
        musicCoverFileName: '',
        musicFileName: '',
        singerName: '',
        albumName: '',
        year: ''
      },
      insertMusicFormRules: {
        musicFile: [
          // 音乐文件上传校验
          {
            validator: (rule, value, callback) => {
              if (value) {
                callback()
              } else {
                callback(new Error('音乐文件未上传'))
              }
            },
            trigger: 'blur'
          }
        ],
        coverFile: [
          // 音乐封面上传校验
          {
            validator: (rule, value, callback) => {
              if (value) {
                callback()
              } else {
                callback(new Error('音乐封面未上传'))
              }
            },
            trigger: 'blur'
          }
        ],
        songName: [
          // 必填项校验
          {
            required: true,
            message: '请输入歌曲名称',
            trigger: 'blur'
          },
          {
            max: 100,
            message: '长度过长',
            trigger: 'blur'
          }
        ],
        singerName: [
          {
            max: 100,
            message: '长度过长',
            trigger: 'blur'
          }
        ],
        albumName: [
          {
            max: 100,
            message: '长度过长',
            trigger: 'blur'
          }
        ]
      },
      coverImage: '',
      isMusicUploaded: false,
      isMusicCoverExist: false,
      updateMusicCover: {},
      fullscreenLoading: false,
      uploadBtnLoading: false
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
      this.resetUploadMusicForm()
    },
    clickConfirmInsertMusicHandler() {
      this.$refs.insertMusicForm.validate(async valid => {
        if (valid) {
          // Loading
          this.fullscreenLoading = true
          this.uploadBtnLoading = true
          UploadMusicDataAPI({ ...this.insertMusicForm, year: new Date(this.insertMusicForm.year).getFullYear() })
            .then(({ data }) => {
              // 成功弹窗
              this.$notify({
                message: data.message,
                type: 'success',
                duration: 2000
              })
            })
            .catch(({ response }) => {
              // 提示错误弹窗
              this.$notify({
                message: response.data.message,
                type: 'error',
                duration: 2000
              })
            })
            .finally(() => {
              this.resetUploadMusicForm()
            })
        } else {
          return false
        }
      })
    },
    // 音乐文件上传成功回调
    uploadMusicFileSuccessHook({ coverName, musicName, meta, songId }) {
      // 文件已上传索引
      this.isMusicUploaded = true
      // 保存音乐元数据
      const musicData = { ...meta, coverName, musicName, songId }
      // 保存音乐数据到表单文件
      this.insertMusicForm = {
        albumName: musicData.album ? musicData.album : '',
        singerName: musicData.artists ? musicData.artists.join('/') : '',
        songName: musicData.title ? musicData.title : '',
        coverFile: true,
        musicFile: true,
        musicCodec: musicData.codec,
        musicCoverFileName: coverName,
        musicFileName: musicName,
        songId: songId,
        songSize: musicData.size,
        year: musicData.year ? new Date().setFullYear(musicData.year) : new Date()
      }
      // 成功上传通知
      this.$notify({
        title: '音乐文件已成功上传',
        type: 'success'
      })
      // 音乐封面
      this.isMusicCoverExist = true
      // 预览音乐封面
      this.coverImage = `${process.env.VUE_APP_REQUEST_URL}/tempCover/${coverName}?time=${Date.now()}`
      // 用于替换封面
      this.updateMusicCover = {
        musicName: songId,
        originCoverName: coverName
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
      this.insertMusicForm.coverFile = true
      this.insertMusicForm.musicCoverFileName = picture
      // 上传音乐封面显示
      this.coverImage = `${process.env.VUE_APP_REQUEST_URL}/tempCover/${picture}?time=${Date.now()}`
    },
    // 重置音乐上传dialog
    resetUploadMusicForm() {
      console.log(1)
      // 重置表单
      this.insertMusicForm = this.$options.data().insertMusicForm
      // Loading
      this.fullscreenLoading = false
      this.uploadBtnLoading = false
      // hide dialog
      this.dialogInsertMusicFormVisible = false
      // clearFile
      this.$refs.uploadMusic.clearFiles()
      this.$refs.uploadCover.clearFiles()
      // reset
      this.isMusicUploaded = false
      this.isMusicCoverExist = false
      this.updateMusicCover = {}
      this.coverImage = ''
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

.el-date-editor.el-input {
  width: 100%;
}
</style>
