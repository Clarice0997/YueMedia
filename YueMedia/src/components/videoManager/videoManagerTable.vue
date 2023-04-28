<template>
  <div>
    <el-table ref="videoManagerTable" :data="videoData" @selection-change="handleSelectionChange" tooltip-effect="dark" class="videoManagerTable" :row-class-name="tableRowClassName" max-height="900">
      <!--  选择列  -->
      <el-table-column type="selection" min-width="55" align="center"></el-table-column>
      <!--  视频 ID  -->
      <el-table-column label="ID" align="center" min-width="150" prop="video_id" sortable></el-table-column>
      <!--  封面  -->
      <el-table-column label="封面" align="center" min-width="200">
        <template slot-scope="scope">
          <div @click="clickPlayHandler(scope.row)">
            <el-image class="video-cover" :src="scope.row.video_cover_file_name | concatCoverUrl"></el-image>
          </div>
        </template>
      </el-table-column>
      <!--  视频名  -->
      <el-table-column label="视频名" prop="video_name" min-width="200" align="center"></el-table-column>
      <!--  视频状态   -->
      <el-table-column label="视频状态" prop="status" width="150" sortable align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="warning" v-if="scope.row.status === 1">私有</el-tag>
          <el-tag size="medium" type="success" v-else>公开</el-tag>
        </template>
      </el-table-column>
      <!--  开放API地址  -->
      <el-table-column label="开放API地址" min-width="220" align="center">
        <template slot-scope="scope">
          <el-link v-if="scope.row.status === 2" :href="scope.row.open_path | concatUrl" :underline="false" type="primary" target="_blank">
            {{ scope.row.open_path | concatUrl }}
          </el-link>
        </template>
      </el-table-column>
      <!--  视频编码格式  -->
      <el-table-column label="编码格式" width="200" sortable align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="success">{{ scope.row.video_codec }}</el-tag>
        </template>
      </el-table-column>
      <!--  视频媒体类型  -->
      <el-table-column label="媒体类型" min-width="200" sortable align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="warning">{{ scope.row.mimetype }}</el-tag>
        </template>
      </el-table-column>
      <!--  创建时间  -->
      <el-table-column label="创建时间" min-width="200" prop="create_time" sortable align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 10px"></i>
          <span>{{ scope.row.create_time | dateFormat }}</span>
        </template>
      </el-table-column>
      <!--  文件大小  -->
      <el-table-column label="文件大小" width="150" prop="video_size" sortable align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.video_size / 1024 / 1024) | numToFixed }} MB</span>
        </template>
      </el-table-column>
      <!-- 操作列  -->
      <el-table-column label="操作" fixed="right" width="200" align="center">
        <template slot-scope="scope">
          <div class="handler-list">
            <a class="icon" @click="clickPlayHandler(scope.row)" title="播放">
              <img src="@/assets/image/icons/play.svg" alt="播放" />
            </a>
            <a class="icon" @click="clickDownloadHandler(scope.row)" title="下载">
              <img src="@/assets/image/icons/download_from_the_cload.svg" alt="下载" />
            </a>
            <a class="icon" @click="clickSettingHandler(scope.row)" title="设置">
              <img src="@/assets/image/icons/settings.svg" alt="设置" />
            </a>
            <a class="icon" @click="clickDeleteHandler(scope.row)" title="删除">
              <img src="@/assets/image/icons/delete_document.svg" alt="删除" />
            </a>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页栏 -->
    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNumber" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalData"></el-pagination>
    </div>
    <!--  设置对话框  -->
    <el-dialog title="视频设置" append-to-body :visible.sync="dialogVisible" width="30%">
      设置视频开放状态：
      <el-select v-model="selectedData.status" placeholder="请选择">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clickCloseDialogHandler">取 消</el-button>
        <el-button type="primary" @click="clickConfirmHandler">确 定</el-button>
      </div>
    </el-dialog>
    <videoPlayer
      v-if="dialogVideoPlayerVisible"
      @showVideoPlayerHandler="showVideoPlayerHandler"
      @closeVideoPlayerHandler="closeVideoPlayerHandler"
      :dialog-video-player-visible="dialogVideoPlayerVisible"
      :video-source="playVideoConfig.src | concatVideoUrl"
      :cover="playVideoConfig.cover | concatCoverUrl"
      :title="playVideoConfig.title"
    ></videoPlayer>
  </div>
</template>

<script>
import { deleteVideoAPI, deleteVideoBatchAPI, downloadVideoAPI, downloadVideoBatchAPI, selectVideoListAPI, startPlayVideoAPI, updateVideoStatusAPI } from '@/apis/videoAPI'
import { formatDate } from '@/utils/formatDate'
import store from '@/store'
import { downloadAPI } from '@/apis/downloadAPI'
import { nextTick } from 'vue'

export default {
  name: 'videoManagerTable',
  data() {
    return {
      videoData: [],
      selectedVideoData: [],
      pageNumber: 1,
      pageSize: 5,
      totalData: 0,
      loading: '',
      dialogVisible: false,
      selectedData: {},
      dialogVideoPlayerVisible: false,
      playVideoConfig: {},
      options: [
        {
          value: 1,
          label: '私有'
        },
        {
          value: 2,
          label: '公开'
        }
      ]
    }
  },
  async mounted() {
    await this.initTableData()
  },
  components: {
    videoPlayer: () => import('@/components/videoManager/videoPlayer.vue')
  },
  filters: {
    numToFixed(value, fixed = 2) {
      if (value !== undefined && value !== null) {
        return value.toFixed(fixed)
      } else {
        return 'N/A'
      }
    },
    dateFormat(value, fmt = 'yyyy年MM月dd日') {
      const myDate = new Date(value)
      return formatDate(myDate, fmt)
    },
    concatCoverUrl(value) {
      if (!value) return
      return `${process.env['VUE_APP_REQUEST_URL']}/videoCover/${store.state['userProfile'].userData.uno}/${value}`
    },
    concatUrl(value) {
      return `${process.env['VUE_APP_REQUEST_URL']}/apis/openapi/video?videoPath=${value}`
    },
    concatVideoUrl(value) {
      return `${process.env['VUE_APP_REQUEST_URL']}/apis/download/video?playVideoPath=video/${store.state.userProfile.userData.uno}/${value}`
    }
  },
  methods: {
    // 初始化表格数据
    async initTableData() {
      const {
        data: { count, videoData }
      } = await selectVideoListAPI(this.pageNumber, this.pageSize)
      this.totalData = count
      this.videoData = videoData
      nextTick(() => {
        this.$refs.videoManagerTable.doLayout()
      })
    },
    // 更新表格数据
    async renewTableData() {
      this.pageNumber = 1
      const {
        data: { count, videoData }
      } = await selectVideoListAPI(this.pageNumber, this.pageSize)
      this.totalData = count
      this.videoData = videoData
      nextTick(() => {
        this.$refs.videoManagerTable.doLayout()
      })
    },
    // 选择表格样式变化
    tableRowClassName({ row, rowIndex }) {
      if (row.status === 2) {
        return 'success-row'
      }
      return ''
    },
    // 选择列改变事件
    handleSelectionChange(val) {
      this.selectedVideoData = val
    },
    // 页面显示条数改变事件
    handleSizeChange(val) {
      // 赋值页面显示条数
      this.pageSize = val
      // 显示条数改变重新获取数据
      this.initTableData()
    },
    // 页码改变事件
    handleCurrentChange(val) {
      // 页码改变
      this.pageNumber = val
      // 页码改变改变重新获取数据
      this.initTableData()
    },
    // 批量下载
    async downloadSelectedFile() {
      if (this.selectedVideoData.length === 0) {
        return this.$message.warning('请选择文件再进行批量操作')
      }
      try {
        const {
          data: { downloadPath }
        } = await downloadVideoBatchAPI(this.selectedVideoData)
        downloadAPI(downloadPath, 'Video Batch Download')
          .then(res => {
            const filename = res.headers['content-disposition'].split('filename=').pop()
            const downloadUrl = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          })
          .catch(error => {
            console.log(error)
            this.$message.error('文件下载异常')
          })
      } catch (error) {
        if (error.response) {
          this.$message.error(error.response.data.message)
        }
      }
    },
    // 批量删除
    removeSelectedFile() {
      if (this.selectedVideoData.length === 0) {
        return this.$message.warning('请选择文件再进行批量操作')
      }
      deleteVideoBatchAPI(this.selectedVideoData)
        .then(async ({ data }) => {
          this.$message.success(data.message)
          await this.renewTableData()
        })
        .catch(error => {
          if (error.response) {
            this.$message.error(error.response.data.message)
          }
        })
    },
    clickPlayHandler(videoData) {
      startPlayVideoAPI(videoData)
        .then(async ({ data }) => {
          this.$message.success(data.message)
          this.playVideoConfig = data
          this.dialogVideoPlayerVisible = true
        })
        .catch(error => {
          if (error.response) {
            this.$message.error(error.response.data.message)
          }
        })
    },
    async clickDownloadHandler(videoData) {
      try {
        // 请求下载视频 API
        const {
          data: { downloadPath }
        } = await downloadVideoAPI(videoData)
        downloadAPI(downloadPath, 'Video Download')
          .then(res => {
            // 中文解码
            const filename = decodeURIComponent(res.headers['content-disposition'].split('filename=').pop())
            const downloadUrl = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          })
          .catch(error => {
            console.log(error)
            this.$message.error('文件下载异常')
          })
      } catch (error) {
        if (error.response) {
          this.$message.error(error.response.data.message)
        }
      }
    },
    clickSettingHandler(videoData) {
      this.dialogVisible = true
      // 深拷贝
      this.selectedData = JSON.parse(JSON.stringify(videoData))
    },
    async clickDeleteHandler(videoData) {
      try {
        // 请求删除视频 API
        const {
          data: { message }
        } = await deleteVideoAPI(videoData)
        this.$message.success(message)
        await this.renewTableData()
      } catch (error) {
        if (error.response) {
          this.$message.error(error.response.data.message)
        }
      }
    },
    clickCloseDialogHandler() {
      this.dialogVisible = false
      this.selectedData = {}
    },
    clickConfirmHandler() {
      updateVideoStatusAPI(this.selectedData)
        .then(({ data }) => {
          this.$message.success(data.message)
          this.initTableData()
        })
        .catch(error => {
          if (error.response) {
            this.$message.error(error.response.data.message)
          }
        })
        .finally(() => {
          this.dialogVisible = false
          this.selectedData = {}
        })
    },
    closeVideoPlayerHandler() {
      this.dialogVideoPlayerVisible = false
    },
    showVideoPlayerHandler() {
      this.dialogVideoPlayerVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.videoManagerTable {
  width: 100%;

  .empty {
    // 元素上下居中
    display: flex;
    flex-direction: column;
    align-items: center;
    // 居中
    margin: auto;
    text-align: center;
    width: 20%;

    img {
      width: 30%;
    }
  }
}

.videoManagerTable::-webkit-scrollbar {
  display: block;
}

.block {
  margin-top: 10px;
}

.handler-list {
  display: flex;
  justify-content: space-evenly;
  padding: 10px;

  .icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
    transition: 0.3s;

    img {
      width: 24px;
      height: 24px;
    }
  }
}

.video-cover {
  cursor: pointer;
  transition: 0.3s;
  border-radius: 5px;
}

.video-cover:hover {
  opacity: 0.7;
}
</style>