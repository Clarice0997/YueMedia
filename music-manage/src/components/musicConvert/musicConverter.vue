<template>
  <div class="music-converter-container">
    <el-progress v-if="isShowProgress" type="circle" :percentage="uploadProgress" class="fixed-progress"></el-progress>
    <input type="file" ref="fileInput" id="file-upload" @change="noSelectUploadFile" multiple />
    <div class="no-select-container">
      <div class="content-area">
        <div class="index-counter">
          <div class="counter-box">我们已转换 <span>100</span> 个文件，总大小为 <span>100</span> TB</div>
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
                <div class="file-search-button">
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
  </div>
</template>

<script>
// import modules
import axios from 'axios'
import { getCookie } from '@/utils/cookie'

export default {
  name: 'musicConverter',
  data() {
    return {
      isShowProgress: false,
      uploadProgress: 0,
      uploadFiles: []
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
  methods: {
    async noSelectUploadFile() {
      let fileNames = []
      // 判断文件数量是否超出数量
      if (this.$refs.fileInput.files.length > this.maxFileNum) {
        return this.$message.error(`一次只能转换 ${this.maxFileNum} 个文件`)
      }
      // 实例化 FormData
      const formData = new FormData()
      // 循环上传文件 构建 FormData
      for (let i = 0; i < this.$refs.fileInput.files.length; i++) {
        formData.append('file[]', this.$refs.fileInput.files[i])
        fileNames.push(this.$refs.fileInput.files[i].name)
      }
      formData.append('fileNames', JSON.stringify(fileNames))
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
          console.log(data)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(() => {
          // 显示进度条
          this.isShowProgress = false
          // 重置上传进度
          this.uploadProgress = 0
        })
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
}
</style>