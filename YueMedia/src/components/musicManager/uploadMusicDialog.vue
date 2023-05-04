<template>
  <!-- 新增音频对话框 -->
  <el-dialog title="新增音频" :visible.sync="localDialogInsertMusicFormVisible" append-to-body @close="resetUploadMusicForm">
    <el-form ref="insertMusicForm" :model="insertMusicForm" :rules="insertMusicFormRules" label-position="top">
      <!-- 上传音频文件 -->
      <el-form-item label="上传音频文件" prop="musicFile">
        <el-upload class="uploadMusic" ref="uploadMusic" :disabled="isMusicUploaded" :before-upload="uploadMusicFileBeforeHook" :on-success="uploadMusicFileSuccessHook" :limit="1" drag name="musicFile" with-credentials :headers="{ Authorization }" :action="targetIp + '/apis/music/upload/music'">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip" style="margin: 0">音频文件大小不超过 100 MB</div>
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
          :before-upload="uploadMusicCoverBeforeHook"
          :on-success="uploadMusicCoverSuccessHook"
          :disabled="!isMusicUploaded"
          name="musicCoverFile"
          :data="updateMusicCover"
          with-credentials
          :headers="{ Authorization }"
          :action="targetIp + '/apis/music/upload/music/cover'"
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
      <el-button type="warning" :disabled="!isMusicUploaded" v-loading.fullscreen="fullscreenLoading" :loading="resetBtnLoading" @click="clickResetInsertMusicHandler">重 置 </el-button>
      <el-button type="primary" :disabled="!isMusicUploaded" v-loading.fullscreen="fullscreenLoading" :loading="uploadBtnLoading" @click="clickConfirmInsertMusicHandler">确 定 </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getCookie } from '@/utils/cookie'
import { uploadMusicDataAPI, deleteTempMusicAPI } from '@/apis/musicAPI'

export default {
  name: 'uploadMusicDialog',
  props: {
    dialogInsertMusicFormVisible: {
      type: Boolean,
      default: false,
      require: true
    }
  },
  data() {
    return {
      targetIp: process.env.VUE_APP_REQUEST_URL,
      localDialogInsertMusicFormVisible: this.dialogInsertMusicFormVisible,
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
          // 音频文件上传校验
          {
            validator: (rule, value, callback) => {
              if (value) {
                callback()
              } else {
                callback(new Error('音频文件未上传'))
              }
            },
            trigger: 'blur'
          }
        ],
        coverFile: [
          // 音频封面上传校验
          {
            validator: (rule, value, callback) => {
              if (value) {
                callback()
              } else {
                callback(new Error('音频封面未上传'))
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
      uploadBtnLoading: false,
      resetBtnLoading: false
    }
  },
  computed: {
    Authorization() {
      return getCookie('Access-Token')
    }
  },
  watch: {
    dialogInsertMusicFormVisible(newValue) {
      this.localDialogInsertMusicFormVisible = newValue
    }
  },
  methods: {
    clickCloseInsertMusicDialogHandler() {
      this.resetUploadMusicForm()
    },
    // 点击确认插入音频处理函数
    clickConfirmInsertMusicHandler() {
      this.$refs.insertMusicForm.validate(async valid => {
        if (valid) {
          // Loading
          this.fullscreenLoading = true
          this.uploadBtnLoading = true
          uploadMusicDataAPI({ ...this.insertMusicForm, year: new Date(this.insertMusicForm.year).getFullYear() })
            .then(({ data }) => {
              // 成功弹窗
              this.$notify({
                title: data.message,
                type: 'success',
                duration: 2000
              })
              this.$emit('renewTableHandler')
            })
            .catch(({ response }) => {
              // 提示错误弹窗
              this.$notify({
                title: response.data.message,
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
    // 音频文件上传前回调
    uploadMusicFileBeforeHook(file) {
      // TODO: 校验重构
      const allowedMimetypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/aiff', 'audio/alac']
      let isAllowedMusic = allowedMimetypes.indexOf(file.type) !== -1
      const isLt100M = file.size / 1024 / 1024 < 100

      // 允许的后缀名
      const allowExtnames = ['ncm']
      if (!isAllowedMusic) {
        isAllowedMusic = allowExtnames.indexOf(file.name.split('.').pop()) !== -1
      }

      if (!isAllowedMusic) {
        this.$message.error('只能上传音频文件（MP3/WAV/FLAC/NCM/AAC/OGG/AIFF/ALAC）')
        return false
      }

      if (!isLt100M) {
        this.$message.error('上传文件大小不能超过 100MB')
        return false
      }

      return isAllowedMusic && isLt100M
    },
    // 音频封面文件上传前回调
    uploadMusicCoverBeforeHook(file) {
      const allowedMimetypes = ['image/jpeg', 'image/png', 'image/jpg']
      const isAllowedImage = allowedMimetypes.indexOf(file.type) !== -1
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isAllowedImage) {
        this.$message.error('只能上传图片文件（JPG/JPEG/PNG）')
        return false
      }

      if (!isLt10M) {
        this.$message.error('上传封面文件大小不能超过 10MB')
        return false
      }

      return isAllowedImage && isLt10M
    },
    // 音频文件上传成功回调
    uploadMusicFileSuccessHook({ coverName, musicName, meta, songId }) {
      // 文件已上传索引
      this.isMusicUploaded = true
      // 保存音频元数据
      const musicData = { ...meta, coverName, musicName, songId }
      // 保存音频数据到表单文件
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
        title: '音频文件已成功上传',
        type: 'success'
      })
      // 音频封面
      this.isMusicCoverExist = true
      // 预览音频封面
      this.coverImage = `${process.env.VUE_APP_REQUEST_URL}/tempCover/${coverName}?time=${Date.now()}`
      // 用于替换封面
      this.updateMusicCover = {
        musicName: songId,
        originCoverName: coverName
      }
    },
    // 音频封面上传成功回调
    uploadMusicCoverSuccessHook({ message, picture }) {
      // 音频封面成功上传通知
      this.$notify({
        title: message,
        type: 'success'
      })
      // 音频封面上传索引
      this.isMusicCoverExist = true
      this.insertMusicForm.coverFile = true
      this.insertMusicForm.musicCoverFileName = picture
      // 上传音频封面显示
      this.coverImage = `${process.env.VUE_APP_REQUEST_URL}/tempCover/${picture}?time=${Date.now()}`
    },
    // 重置音频上传 dialog
    resetUploadMusicForm() {
      // 重置表单
      this.insertMusicForm = this.$options.data().insertMusicForm
      // Loading
      this.fullscreenLoading = false
      this.uploadBtnLoading = false
      // hide dialog
      // Method 1: 调用自定义事件
      this.$emit('hideInsertMusicDialogHandler')
      // Method 2: 直接调用父组件方法（不推荐）
      // this.$parent.hideInsertMusicDialogHandler()
      // clearFile
      this.$refs.uploadMusic.clearFiles()
      this.$refs.uploadCover.clearFiles()
      // reset
      this.isMusicUploaded = false
      this.isMusicCoverExist = false
      this.updateMusicCover = {}
      this.coverImage = ''
    },
    // 删除临时音频文件
    async deleteTempMusic() {
      try {
        const {
          data: { message }
        } = await deleteTempMusicAPI(this.insertMusicForm.musicFileName, this.insertMusicForm.musicCoverFileName)
        // 成功弹窗
        this.$notify({
          title: message,
          type: 'success',
          duration: 2000
        })
      } catch (error) {
        console.log(error)
      }
    },
    // 点击重置按钮处理事件
    async clickResetInsertMusicHandler() {
      // Loading
      this.fullscreenLoading = true
      this.resetBtnLoading = true
      // 清除临时文件
      await this.deleteTempMusic()
      // 重置表单
      this.insertMusicForm = this.$options.data().insertMusicForm
      // clearFile
      this.$refs.uploadMusic.clearFiles()
      this.$refs.uploadCover.clearFiles()
      // reset
      this.isMusicUploaded = false
      this.isMusicCoverExist = false
      this.updateMusicCover = {}
      this.coverImage = ''
      // Loading Complete
      this.fullscreenLoading = false
      this.resetBtnLoading = false
    }
  }
}
</script>

<style scoped lang="less">
.el-date-editor.el-input {
  width: 100%;
}

.el-form {
  width: 350px;
}
</style>