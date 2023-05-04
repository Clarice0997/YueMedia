<template>
  <el-dialog title="新增歌曲" @close="clickCloseInsertVideoDialogHandler" :visible.sync="localDialogInsertVideoFormVisible" append-to-body destroy-on-close>
    <el-form ref="insertVideoForm" :model="insertVideoForm" :rules="insertVideoFormRules" label-position="top">
      <!-- 上传视频文件 -->
      <el-form-item label="上传视频文件" prop="videoFile">
        <el-upload class="uploadVideo" ref="uploadVideo" :disabled="isVideoUploaded" :before-upload="uploadVideoFileBeforeHook" :on-success="uploadVideoFileSuccessHook" :limit="1" drag name="videoFile" with-credentials :headers="{ Authorization }" :action="targetIp + '/apis/video/upload/video'">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip" style="margin: 0">视频文件大小不超过 1 GB</div>
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
          class="uploadVideoCover"
          :show-file-list="false"
          :before-upload="uploadVideoCoverBeforeHook"
          :on-success="uploadVideoCoverSuccessHook"
          :disabled="!isVideoUploaded"
          name="videoCoverFile"
          :data="updateVideoCover"
          with-credentials
          :headers="{ Authorization }"
          :action="targetIp + '/apis/video/upload/video/cover'"
          list-type="picture-card"
          style="float: right"
          ref="uploadCover"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <!-- 视频名称 -->
      <el-form-item label="视频名称" prop="videoName">
        <el-input v-model="insertVideoForm.videoName" placeholder="输入视频名称" clearable :disabled="!isVideoUploaded"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="clickCloseInsertVideoDialogHandler">取 消</el-button>
      <el-button type="warning" :disabled="!isVideoUploaded" v-loading.fullscreen="fullscreenLoading" :loading="resetBtnLoading" @click="clickResetInsertVideoHandler">重 置 </el-button>
      <el-button type="primary" :disabled="!isVideoUploaded" v-loading.fullscreen="fullscreenLoading" :loading="uploadBtnLoading" @click="clickConfirmInsertVideoHandler">确 定 </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getCookie } from '@/utils/cookie'
import { deleteTempVideoAPI, uploadVideoDataAPI } from '@/apis/videoAPI'

export default {
  name: 'uploadVideoDialog',
  props: {
    dialogInsertVideoFormVisible: {
      type: Boolean,
      default: false,
      require: true
    }
  },
  data() {
    return {
      targetIp: process.env.VUE_APP_REQUEST_URL,
      localDialogInsertVideoFormVisible: this.dialogInsertVideoFormVisible,
      insertVideoForm: {
        videoFile: false,
        coverFile: false,
        videoName: '',
        videoId: '',
        videoSize: 0,
        videoCodec: '',
        videoFileName: '',
        videoCoverFileName: '',
        mimetype: ''
      },
      insertVideoFormRules: {
        videoFile: [
          // 视频文件上传校验
          {
            validator: (rule, value, callback) => {
              if (value) {
                callback()
              } else {
                callback(new Error('文件未上传'))
              }
            },
            trigger: 'blur'
          }
        ],
        coverFile: [
          // 封面上传校验
          {
            validator: (rule, value, callback) => {
              if (value) {
                callback()
              } else {
                callback(new Error('封面未上传'))
              }
            },
            trigger: 'blur'
          }
        ],
        videoName: [
          // 必填项校验
          {
            required: true,
            message: '请输入视频名称',
            trigger: 'blur'
          },
          {
            max: 100,
            message: '长度过长',
            trigger: 'blur'
          }
        ]
      },
      isVideoUploaded: false,
      coverImage: '',
      updateVideoCover: {},
      fullscreenLoading: false,
      uploadBtnLoading: false,
      resetBtnLoading: false
    }
  },
  watch: {
    dialogInsertVideoFormVisible(newValue) {
      this.localDialogInsertVideoFormVisible = newValue
    }
  },
  mounted() {},
  computed: {
    Authorization() {
      return getCookie('Access-Token')
    }
  },
  methods: {
    uploadVideoFileBeforeHook(file) {
      const allowedMimetypes = ['video/x-flv', 'video/x-ms-wmv', 'video/quicktime', 'video/x-msvideo', 'video/mp4', 'video/avi']
      let isAllowedVideo = allowedMimetypes.indexOf(file.type) !== -1
      const isLt1G = file.size / 1024 / 1024 < 1024

      if (!isAllowedVideo) {
        this.$message.error('只能上传视频文件（MP4，AVI，MOV）')
        return false
      }

      if (!isLt1G) {
        this.$message.error('上传文件大小不能超过 1 GB')
        return false
      }

      return isAllowedVideo && isLt1G
    },
    uploadVideoFileSuccessHook({ videoId, videoFileName, videoCoverFileName, videoSize, mimetype }, file) {
      // 文件已上传索引
      this.isVideoUploaded = true
      // 获取文件名
      const originName = file.name.split('.')
      originName.pop()
      const videoName = originName.join('')
      // 保存视频数据到表单文件
      this.insertVideoForm = {
        coverFile: true,
        videoFile: true,
        videoId,
        videoFileName,
        videoCoverFileName,
        videoName,
        videoSize,
        mimetype
      }
      // 成功上传通知
      this.$notify({
        title: '视频文件已成功上传',
        type: 'success'
      })
      // 预览视频封面
      this.coverImage = `${process.env.VUE_APP_REQUEST_URL}/tempVideoCover/${videoCoverFileName}?time=${Date.now()}`
      // 用于替换封面
      this.updateVideoCover = {
        videoId,
        videoCoverFileName
      }
    },
    uploadVideoCoverBeforeHook(file) {
      // TODO: 校验重构
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
    uploadVideoCoverSuccessHook({ message, videoCoverFileName }) {
      // 封面成功上传通知
      this.$notify({
        title: message,
        type: 'success'
      })
      // 封面上传索引
      this.insertVideoForm.coverFile = true
      this.insertVideoForm.videoCoverFileName = videoCoverFileName
      // 预览视频封面
      this.coverImage = `${process.env.VUE_APP_REQUEST_URL}/tempVideoCover/${videoCoverFileName}?time=${Date.now()}`
    },
    clickCloseInsertVideoDialogHandler() {
      this.resetUploadVideoForm()
      this.$emit('hideInsertVideoDialogHandler')
    },
    // 删除临时视频文件
    async deleteTempVideo() {
      try {
        const {
          data: { message }
        } = await deleteTempVideoAPI(this.insertVideoForm.videoFileName, this.insertVideoForm.videoCoverFileName)
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
    // 重置视频上传 dialog
    resetUploadVideoForm() {
      // 重置表单
      this.insertVideoForm = this.$options.data().insertVideoForm
      // Loading
      this.fullscreenLoading = false
      this.uploadBtnLoading = false
      // hide dialog
      // Method 1: 调用自定义事件
      // this.$emit('hideInsertVideoDialogHandler')
      // Method 2: 直接调用父组件方法（不推荐）
      // this.$parent.hideInsertVideoDialogHandler
      // clearFile
      this.$refs.uploadVideo.clearFiles()
      this.$refs.uploadCover.clearFiles()
      // reset
      this.isVideoUploaded = false
      this.updateVideoCover = {}
      this.coverImage = ''
    },
    clickResetInsertVideoHandler() {
      this.deleteTempVideo()
      this.resetUploadVideoForm()
    },
    clickConfirmInsertVideoHandler() {
      this.$refs.insertVideoForm.validate(async valid => {
        if (valid) {
          // Loading
          this.fullscreenLoading = true
          this.uploadBtnLoading = true
          uploadVideoDataAPI(this.insertVideoForm)
            .then(({ data }) => {
              // 成功弹窗
              this.$notify({
                title: data.message,
                type: 'success',
                duration: 2000
              })
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
              this.resetUploadVideoForm()
              // 刷新表格数据 & 隐藏 dialog
              this.$emit('renewVideoTableDataHandler')
              this.$emit('hideInsertVideoDialogHandler')
            })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-date-editor.el-input {
  width: 100%;
}

.el-form {
  width: 350px;
}
</style>