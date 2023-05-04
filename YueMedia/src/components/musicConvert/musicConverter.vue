<template>
  <div class="music-converter-container">
    <input type="file" ref="fileInput" id="file-upload" @change="selectUploadFile" multiple :disabled="!isAllowUpload" />
    <div class="no-select-container" v-if="!isUploaded">
      <div class="content-area">
        <div class="index-counter">
          <div class="counter-box">
            我们已转换 <span>{{ musicConvertAnalyse.totalTasks }}</span> 个文件，总大小为 <span>{{ (musicConvertAnalyse.totalSize / 1024 / 1024) | numToFixed }}</span> MB，平均转码速度
            <span>{{ musicConvertAnalyse.averageSpeed | numToFixed }}</span>
            MS
          </div>
        </div>
        <div class="converter-container">
          <div class="converter-wrapper">
            <div class="converter">
              <div class="file-source-button-wrapper">
                <div class="file-source-button">
                  <label class="action-label" for="file-upload">
                    <span>选择文件</span>
                  </label>
                </div>
                <div class="file-search-button" @click="clickSelectMusicTable">
                  <span>
                    <i class="fas fa-folder-open"></i>
                  </span>
                </div>
              </div>
              <div class="file-source-caption">
                <span>一次最多上传 {{ maxFileNum }} 个文件，文件大小最大为 {{ maxFileSize }} MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="with-select-container">
      <div class="files-container-box">
        <div class="data-table-wrapper">
          <el-table :data="uploadFiles" style="width: 100%" :show-header="false">
            <!--  源文件名  -->
            <el-table-column prop="originalName" width="350" align="center">
              <template slot-scope="scope">
                <div style="display: flex; align-items: center">
                  <i class="far fa-file-audio" style="margin: 0 20px"></i>
                  <span class="file-name-title">{{ scope.row.originalName | truncateFilename(20) }}</span>
                </div>
              </template>
            </el-table-column>
            <!--  源文件格式  -->
            <el-table-column width="250" align="center">
              <template slot-scope="scope">
                <span style="margin-right: 10px">源文件格式：</span>
                <span style="font-weight: 400">{{ scope.row.codec }}</span>
              </template>
            </el-table-column>
            <!--  目标转换格式  -->
            <el-table-column align="center">
              <template slot-scope="scope">
                <span style="margin-right: 10px">转换格式</span>
                <el-select v-model="scope.row.targetCodec" filterable placeholder="请选择" clearable>
                  <el-option v-for="(item, index) in supportMusicCodec" :key="index" :label="item.codec" :value="item.codec" :disabled="item.codec === scope.row.codec"></el-option>
                </el-select>
              </template>
            </el-table-column>
            <!--  文件状态  -->
            <el-table-column width="100" align="center">
              <template slot-scope="scope">
                <el-tag type="success" v-if="scope.row.status === 1">就绪</el-tag>
                <el-tag type="danger" v-else>错误</el-tag>
              </template>
            </el-table-column>
            <!--  文件大小  -->
            <el-table-column width="100" align="center">
              <template slot-scope="scope">
                <span>{{ (scope.row.size / 1024 / 1024) | numToFixed }} MB</span>
              </template>
            </el-table-column>
            <!--  删除按钮  -->
            <el-table-column width="100" align="center">
              <template slot-scope="scope">
                <i class="fas fa-times del-icon" @click="handleDeleteTempCovertMusic(scope.$index, scope.row)"></i>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="file-tools">
          <div class="file-tools-sticky-wrapper">
            <div class="file-tools-sticky">
              <div class="btn-holder1">
                <el-select :disabled="!isAllowUpload" placeholder="添加更多文件" v-model="selectedOption" size="medium" @change="handleOptionChange">
                  <el-option v-for="(item, index) in options" :key="index" :label="item" :value="item"></el-option>
                </el-select>
                <div class="add-btn-caption">使用 Ctrl 或 Shift 一次添加多个文件</div>
                <div class="warning-max-tip" v-if="uploadFiles.length >= 5">一次最多处理5个文件</div>
                <el-progress v-if="isShowProgress" :text-inside="true" :stroke-width="24" :percentage="uploadProgress" class="file-progress">上传进度 </el-progress>
              </div>
              <div class="btn-holder2">
                <div class="convert-button">
                  <button type="button" :disabled="isUploading" @click="submitCoverMusicQuest">转换音频<i class="fas fa-arrow-right"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-steps :active="stepActive" align-center style="margin-top: 40px">
      <el-step title="上传音频文件"></el-step>
      <el-step title="选择目标转码格式"></el-step>
      <el-step title="提交转码任务"></el-step>
    </el-steps>
    <!--  音频介绍  -->
    <el-collapse accordion v-if="isUploaded" style="margin-top: 50px; padding: 10px; border: 0">
      <el-collapse-item v-for="(item, index) in introData">
        <template slot="title">
          <h1>{{ item.codec }}</h1>
        </template>
        <div style="text-align: left">{{ item.introduction }}</div>
      </el-collapse-item>
    </el-collapse>
    <!--  选择我的音乐  -->
    <selectMusicTable :dialog-select-music-table-visible="dialogSelectMusicTableVisible" @uploadSelectFile="uploadSelectFile" @closeSelectMusicTable="closeSelectMusicTable"></selectMusicTable>
  </div>
</template>

<script>
// import modules
import axios from 'axios'
import { getCookie } from '@/utils/cookie'
import { deleteConvertMusicAPI, getSupportMusicCodecAPI, submitMusicConvertTaskAPI, getMusicConvertAnalyseAPI, uploadMyFileConvertMusicAPI } from '@/apis/musicConvertAPI'

export default {
  name: 'musicConverter',
  data() {
    return {
      isUploaded: false,
      isShowProgress: true,
      uploadProgress: 0,
      selectedOption: '',
      supportMusicCodec: [],
      uploadFiles: [],
      isUploading: false,
      options: ['选择文件', '我的音频'],
      stepActive: 0,
      musicConvertAnalyse: {
        totalTasks: 0,
        totalSize: 0,
        averageSpeed: 0
      },
      activeName: '1',
      introData: [],
      dialogSelectMusicTableVisible: false,
      loading: ''
    }
  },
  props: {
    maxFileNum: {
      type: Number,
      default: 5
    },
    maxFileSize: {
      type: Number,
      default: 100
    }
  },
  computed: {
    isAllowUpload() {
      return this.uploadFiles.length < this.maxFileNum && !this.isUploading
    }
  },
  components: {
    selectMusicTable: () => import('@/components/musicConvert/selectMusicTable.vue')
  },
  watch: {
    // 监听全选目标转码格式
    uploadFiles: {
      handler: function (files) {
        if (files.every(file => file.targetCodec)) this.stepActive = 2
        if (files.length === 0) this.stepActive = 0
        // 监听格式 生成格式介绍
        const introSet = new Set()
        files.forEach(file => {
          introSet.add(file.codec)
          if (file.targetCodec) introSet.add(file.targetCodec)
        })
        const introArr = [...introSet]
        this.introData = introArr.map(intro => {
          return {
            codec: intro,
            introduction: this.supportMusicCodec.find(item => item.codec === intro).introduction
          }
        })
      },
      // 对象深度监听
      deep: true
    }
  },
  mounted() {
    this.executeMountedCode()
  },
  filters: {
    numToFixed(value, fixed = 2) {
      if (value !== undefined && value !== null) {
        return value.toFixed(fixed)
      } else {
        return 'N/A'
      }
    },
    truncateFilename(value, maxLength) {
      if (!value) return ''
      if (value.length <= maxLength) return value
      const extensionIndex = value.lastIndexOf('.')
      const name = value.substring(0, extensionIndex)
      const extension = value.substring(extensionIndex)
      const truncatedName = name.substring(0, maxLength - extension.length - 1)
      return truncatedName + '...' + extension
    }
  },
  methods: {
    executeMountedCode() {
      // 获取音频转码统计数据
      this.getMusicConvertAnalyse()
      // 获取支持的音频文件数据
      getSupportMusicCodecAPI().then(({ data: { supportMusicCodec } }) => {
        this.supportMusicCodec = supportMusicCodec
      })
    },
    // 获取音频转码统计数据
    async getMusicConvertAnalyse() {
      const {
        data: { totalMusicConvertRecord }
      } = await getMusicConvertAnalyseAPI()
      this.musicConvertAnalyse = totalMusicConvertRecord
    },
    // 全屏加载函数
    openFullScreen(text) {
      return this.$loading({
        lock: true,
        text: text ? text : 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    // 上传文件事件
    async selectUploadFile() {
      // 判断是否上传文件
      if (!this.$refs.fileInput.files) {
        return this.$message.warning(`请上传待转换文件`)
      }
      // 判断文件数量是否超出数量
      if (this.uploadFiles.length + this.$refs.fileInput.files.length > this.maxFileNum) {
        return this.$message.error(`一次只能转换 ${this.maxFileNum} 个文件`)
      }
      // 判断上传文件是否符合规范
      // TODO: 校验重构
      let allowedFormats = this.supportMusicCodec.map(format => format.extname)
      let allowedMimetypes = this.supportMusicCodec.map(format => format.mimetype)
      for (let i = 0; i < this.$refs.fileInput.files.length; i++) {
        let fileExt = this.$refs.fileInput.files[i].name.split('.').pop()
        let fileMimetype = this.$refs.fileInput.files[i].type
        if (!allowedFormats.includes(`.${fileExt}`) || !allowedMimetypes.includes(fileMimetype)) {
          return this.$message.error(`文件 ${this.$refs.fileInput.files[i].name} 不符合支持的格式`)
        }
      }

      // 上传操作
      let fileNames = []
      // 实例化 FormData
      const formData = new FormData()
      // 循环上传文件 构建 FormData
      for (let i = 0; i < this.$refs.fileInput.files.length; i++) {
        formData.append('file[]', this.$refs.fileInput.files[i])
        fileNames.push(this.$refs.fileInput.files[i].name)
      }
      formData.append('fileNames', JSON.stringify(fileNames))
      // 上传文件中状态改变
      this.isUploaded = true
      this.isUploading = true
      // 发起网络请求 发送文件
      axios({
        baseURL: process.env.VUE_APP_REQUEST_URL,
        url: '/apis/convert/upload',
        method: 'post',
        headers: {
          Authorization: `Bearer ${getCookie('Access-Token')}`,
          'Content-Type': 'multipart/form-data'
        },
        data: formData,
        // 上传进度
        onUploadProgress: progressEvent => {
          if (progressEvent.lengthComputable) {
            // 显示进度条
            this.isShowProgress = true
            // 实时获取上传进度
            this.uploadProgress = Math.ceil((progressEvent.loaded / progressEvent.total) * 100)
          } else {
            // 显示进度条
            this.isShowProgress = false
          }
        }
      })
        .then(({ data }) => {
          // 插入已上传文件
          if (data.filesDetail) {
            data.filesDetail.forEach(file => {
              this.uploadFiles.push(file)
            })
          }
          // 改变进行步骤状态
          if (this.stepActive === 0) this.stepActive = 1
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          // 显示进度条
          this.isShowProgress = false
          // 重置上传进度
          this.uploadProgress = 0
          // 改变文件上传状态
          this.isUploading = false
          // 重置上传文件输入框
          this.$refs.fileInput.value = ''
        })
    },
    handleOptionChange() {
      if (this.selectedOption === '选择文件') {
        document.getElementById('file-upload').click()
        this.selectedOption = ''
      } else if (this.selectedOption === '我的音频') {
        this.dialogSelectMusicTableVisible = true
        this.selectedOption = ''
      }
    },
    clickSelectMusicTable() {
      this.dialogSelectMusicTableVisible = true
    },
    closeSelectMusicTable() {
      this.dialogSelectMusicTableVisible = false
    },
    async handleDeleteTempCovertMusic(index, row) {
      // 删除对应索引数据
      this.uploadFiles.splice(index, 1)
      // 删除服务器临时代转换音乐文件
      await deleteConvertMusicAPI(row.musicFileName)
    },
    // 提交转换音频文件请求
    async submitCoverMusicQuest() {
      // 判断是否存在数据
      if (this.uploadFiles.length === 0) {
        return this.$message.error('数据不存在')
      }

      // 判断文件是否都选择了转换格式
      if (!this.uploadFiles.every(file => file.targetCodec)) {
        return this.$message.error('未选择目标编码格式')
      }

      // 提交音频转码任务
      submitMusicConvertTaskAPI(this.uploadFiles)
        .then(() => {
          this.reset()
          this.$message.success('任务提交成功，请及时前往处理文件查看处理结果')
        })
        .catch(error => {
          this.reset()
          if (error.response) {
            this.$message({
              message: error.response.data.message,
              type: 'error',
              duration: 2000
            })
          }
        })
    },
    uploadSelectFile(fileList) {
      console.log(fileList)
      // 判断文件数量是否超出数量
      if (this.uploadFiles.length + fileList.length > this.maxFileNum) {
        return this.$message.error(`一次只能转换 ${this.maxFileNum} 个文件`)
      }
      // Loading
      this.loading = this.openFullScreen('上传我的音频中')
      // 上传文件中状态改变
      this.isUploaded = true
      this.isUploading = true
      // 上传我的音频
      uploadMyFileConvertMusicAPI(fileList)
        .then(({ data }) => {
          // 插入已上传文件
          if (data.filesDetail) {
            data.filesDetail.forEach(file => {
              this.uploadFiles.push(file)
            })
          }
          // 改变进行步骤状态
          if (this.stepActive === 0) this.stepActive = 1
        })
        .catch(error => {
          if (error.response) {
            this.$message.error(error)
          }
        })
        .finally(() => {
          // 显示进度条
          this.isShowProgress = false
          // 重置上传进度
          this.uploadProgress = 0
          // 改变文件上传状态
          this.isUploading = false
          // 重置上传文件输入框
          this.$refs.fileInput.value = ''
          // 隐藏表格
          this.dialogSelectMusicTableVisible = false
          // 取消 Loading
          this.loading.close()
        })
    },
    // 重置组件
    reset() {
      Object.assign(this.$data, this.$options.data())
      // 重新获取数据
      this.executeMountedCode()
    }
  }
}
</script>

<style lang="less" scoped>
// 去除上传文件标签样式
input[type='file'] {
  display: none;
}

.music-converter-container {
  margin: 30px auto;
  padding: 10px 30px;
  width: 100%;

  .no-select-container {
    box-sizing: border-box;

    .content-area {
      user-select: none;
      box-sizing: border-box;

      .index-counter {
        padding: 38px 60px 42px;
        font-size: 25px;
        line-height: 34px;
        letter-spacing: -0.3px;
        font-weight: normal;
        width: 100%;
        height: 165px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0;
        position: relative;
        z-index: 1;
        color: #dadada;
        background: linear-gradient(180deg, #565656 0, #434343);
        box-shadow: 0 0 44px 2px rgba(0, 0, 0, 0.07), 0 20px 18px -8px rgba(0, 0, 0, 0.1);

        span {
          color: #fff;
          font-weight: 600;
          letter-spacing: 1.5px;
        }
      }

      .converter-container {
        width: 100%;
        margin-bottom: 40px;

        .converter-wrapper {
          position: relative;
          padding-top: 26px;
          padding-bottom: 26px;
          background-color: #3c3c3c;
          background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.06) 25%, transparent 0), linear-gradient(-45deg, rgba(0, 0, 0, 0.06) 25%, transparent 0), linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.06) 0), linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.06) 0);
          background-size: 24px 24px;
          background-position: 0 0, 0 12px, 12px -12px, -12px 0;

          .converter {
            padding: 45px 30px 0;

            .file-source-button-wrapper {
              display: flex;
              padding-bottom: 30px;
              text-align: center;
              justify-content: center;

              .file-source-button {
                margin-right: 20px;
                width: auto;
                max-width: 455px;
                font-size: 0;
                box-shadow: 2px 7px 10px 0 rgba(0, 0, 0, 0.2), 2px 11px 11px 0 rgba(0, 0, 0, 0.2), 2px 6px 8px 0 rgba(0, 0, 0, 0.16), 2px 5px 8px 0 rgba(252, 22, 0, 0.1);
                background-color: #ff4335;
                color: white;
                border-radius: 4px;
                transition: 0.3s;

                .action-label {
                  display: inline-block;
                  vertical-align: top;
                  padding: 20px;
                  width: 194px;
                  color: inherit;
                  font-size: 16px;
                  line-height: 25px;
                  font-weight: 400;
                  cursor: pointer;

                  label {
                    display: inline-block;
                    vertical-align: top;
                    margin: 0;
                    padding: 20px 10px 20px 20px;
                    width: 194px;
                    color: inherit;
                    font-size: 16px;
                    line-height: 25px;
                    font-weight: 400;
                    cursor: pointer;
                  }
                }
              }

              .file-source-button:hover {
                opacity: 0.7;
              }

              .file-search-button {
                font-size: 0;
                box-shadow: 2px 7px 10px 0 rgba(0, 0, 0, 0.2), 2px 11px 11px 0 rgba(0, 0, 0, 0.2), 2px 6px 8px 0 rgba(0, 0, 0, 0.16), 2px 5px 8px 0 rgba(252, 22, 0, 0.1);
                background-color: #ff4335;
                color: white;
                border-radius: 4px;
                transition: 0.3s;

                span {
                  display: inline-block;
                  padding: 20px;
                  width: 65px;
                  color: inherit;
                  font-size: 16px;
                  line-height: 25px;
                  font-weight: 400;
                  cursor: pointer;

                  i {
                  }
                }
              }

              .file-search-button:hover {
                opacity: 0.7;
              }
            }

            .file-source-caption {
              padding: 13px 0 2px;
              color: #959595;
              letter-spacing: -0.3px;
              cursor: default;
            }
          }
        }
      }
    }
  }

  .with-select-container {
    box-sizing: border-box;
    min-width: 1000px;

    .files-container-box {
      border-radius: 0 0 4px 4px;
      background-color: #f8f8f8;
      box-shadow: 0 18px 100px 4px rgba(0, 0, 0, 0.15);
      -webkit-background-clip: padding-box;
      -webkit-backface-visibility: hidden;

      .data-table-wrapper {
        background-color: #fff;
        box-shadow: 0 7px 0 0 rgba(70, 70, 70, 0.01), 0 6px 0 0 rgba(65, 65, 65, 0.01), 0 5px 0 0 rgba(60, 60, 60, 0.01), 0 4px 0 0 rgba(55, 55, 55, 0.01), 0 3px 0 0 rgba(50, 50, 50, 0.01), 0 2px 0 0 rgba(50, 50, 50, 0.01), 0 1px 0 0 rgba(45, 45, 45, 0.01);
      }

      .file-tools {
        margin-top: -40px;

        .file-tools-sticky-wrapper {
          min-height: 70.4688px;

          .file-tools-sticky {
            margin-top: 40px;
            flex-wrap: nowrap;
            border-radius: 0 0 4px 4px;
            display: flex;
            color: #999;
            background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.15) 100%), radial-gradient(at top center, rgba(255, 255, 255, 0.4) 0%, rgba(0, 0, 0, 0.4) 120%) #989898;
            background-blend-mode: multiply, multiply;

            .btn-holder1 {
              padding: 17px 26px;
              display: flex;
              text-align: left;
              flex: 1;
              width: auto;
              align-items: center;

              .add-btn-caption {
                color: whitesmoke;
                display: block;
                align-self: center;
                margin: -5px 0 -5px 32px;
                max-height: 40px;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 16px;
                line-height: 20px;
              }

              .warning-max-tip {
                color: #f44336;
                display: block;
                align-self: center;
                margin: -5px 0 -5px 32px;
                max-height: 40px;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 16px;
                line-height: 20px;
              }
            }

            .btn-holder2 {
              flex: 0 1 auto;
              width: auto;
              flex-wrap: nowrap;
              display: flex;

              .convert-button {
                min-width: 268px;
                flex: 0 1 auto;
                text-align: center;

                button {
                  border-radius: 0 0 4px 0;
                  position: relative;
                  min-width: 100%;
                  width: 100%;
                  height: 100%;
                  padding: 20px 66px 20px 60px;
                  font-size: 19px;
                  line-height: 28px;
                  letter-spacing: -0.6px;
                  font-weight: 700;
                  text-align: left;
                  cursor: pointer;
                  background-color: #ff4335;
                  color: #fff;
                  text-decoration: none;
                  border: 1px solid transparent;
                  transition: 0.3s;

                  i {
                    margin-left: 40px;
                    transition: 0.3s;
                  }
                }

                button:hover {
                  opacity: 0.8;

                  i {
                    transform: translateX(30px);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

.del-icon {
  cursor: pointer;
  transition: 0.3s;
}

.del-icon:hover {
  color: red;
}

.file-progress {
  width: 200px;
  margin-left: 20px;
}
</style>