<template>
  <div>
    <el-table ref="musicManagerTable" :data="musicData" @selection-change="handleSelectionChange" tooltip-effect="dark" class="musicManagerTable" :row-class-name="tableRowClassName" max-height="900" :default-sort="{ prop: 'create_time', order: 'ascending' }">
      <!--  选择列  -->
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <!--  音频 ID  -->
      <el-table-column label="ID" align="center" width="150" prop="song_id" sortable></el-table-column>
      <!--  封面  -->
      <el-table-column label="封面" align="center" width="150">
        <template slot-scope="scope">
          <el-avatar shape="square" :size="100" fit="cover" :src="scope.row.music_cover_file_name | concatCoverUrl"></el-avatar>
        </template>
      </el-table-column>
      <!--  音频名  -->
      <el-table-column label="音频名" prop="song_name" width="150" align="center"></el-table-column>
      <!--  音频状态   -->
      <el-table-column label="音频状态" prop="status" width="150" sortable align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="warning" v-if="scope.row.status === 1">私有</el-tag>
          <el-tag size="medium" type="success" v-else>公开</el-tag>
        </template>
      </el-table-column>
      <!--  开放API地址  -->
      <el-table-column label="开放API地址" prop="music_api" width="200" align="center">
        <template slot-scope="scope"></template>
      </el-table-column>
      <!--  音频编码格式  -->
      <el-table-column label="编码格式" prop="music_codec" width="150" sortable align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="success">{{ scope.row.music_codec }}</el-tag>
        </template>
      </el-table-column>
      <!--  专辑名   -->
      <el-table-column label="专辑名" prop="album_name" width="200" sortable align="center"></el-table-column>
      <!--  歌手   -->
      <el-table-column label="歌手" prop="singer_name" width="150" sortable align="center"></el-table-column>
      <!--  创建时间  -->
      <el-table-column label="创建时间" width="180" prop="create_time" sortable align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 10px"></i>
          <span>{{ scope.row.create_time | dateFormat }}</span>
        </template>
      </el-table-column>
      <!--  文件大小  -->
      <el-table-column label="文件大小" width="150" prop="song_size" sortable align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.song_size / 1024 / 1024) | numToFixed }} MB</span>
        </template>
      </el-table-column>
      <!--  年份  -->
      <el-table-column label="年份" prop="year" sortable align="center"></el-table-column>
      <!-- 操作列  -->
      <el-table-column label="操作" fixed="right" width="200" align="center">
        <template slot-scope="scope">
          <div class="handler-list">
            <p class="icon" @click="clickPlayHandler(scope.row)">
              <img src="@/assets/image/icons/play.svg" />
            </p>
            <p class="icon" @click="clickDownloadHandler(scope.row)">
              <img src="@/assets/image/icons/download_from_the_cload.svg" />
            </p>
            <p class="icon">
              <img src="@/assets/image/icons/settings.svg" />
            </p>
            <p class="icon">
              <img src="@/assets/image/icons/delete_document.svg" />
            </p>
          </div>
        </template>
      </el-table-column>
      <!--  数据为空插槽  -->
      <template slot="empty">
        <div class="empty">
          <img src="../../assets/image/icons/empty.png" alt="empty" />
          <span>暂无音频数据</span>
        </div>
      </template>
    </el-table>
    <!-- 分页栏 -->
    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNumber" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalData"></el-pagination>
    </div>
  </div>
</template>

<script>
import { deleteMusicBatchAPI, downloadMusicAPI, downloadMusicBatchAPI, selectMusicListAPI, startPlayMusicAPI } from '@/apis/musicAPI'
import { formatDate } from '@/utils/formatDate'
import store from '@/store'
import { downloadAPI } from '@/apis/downloadAPI'

export default {
  name: 'musicManagerTable',
  data() {
    return {
      musicData: [],
      selectedMusicData: [],
      pageNumber: 1,
      pageSize: 5,
      totalData: 0,
      loading: ''
    }
  },
  async mounted() {
    await this.initTableData()
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
      return `${process.env['VUE_APP_REQUEST_URL']}/cover/${store.state['userProfile'].userData.uno}/${value}`
    }
  },
  methods: {
    // 初始化表格数据
    async initTableData() {
      const {
        data: { count, musicData }
      } = await selectMusicListAPI(this.pageNumber, this.pageSize)
      this.totalData = count
      this.musicData = musicData
    },
    // 更新表格数据
    async renewTableData() {
      const {
        data: { count, musicData }
      } = await selectMusicListAPI(1, this.pageSize)
      this.totalData = count
      this.musicData = musicData
    },
    // 选择表格样式变化
    tableRowClassName({ row, rowIndex }) {
      if (!row.audited) {
        return 'warning-row'
      }
      return ''
    },
    // 选择列改变事件
    handleSelectionChange(val) {
      this.selectedMusicData = val
    },
    // 批量下载
    async downloadSelectedFile() {
      if (this.selectedMusicData.length === 0) {
        return this.$message.warning('请选择文件再进行批量操作')
      }
      try {
        const {
          data: { downloadPath }
        } = await downloadMusicBatchAPI(this.selectedMusicData)
        downloadAPI(downloadPath).then(res => {
          const filename = res.headers['content-disposition'].split('filename=').pop()
          const downloadUrl = window.URL.createObjectURL(new Blob([res.data]))
          const link = document.createElement('a')
          link.href = downloadUrl
          link.setAttribute('download', filename)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
      } catch (error) {
        if (error.response) {
          this.$message.error(error.response.data.message)
        }
      }
    },
    // 批量删除
    removeSelectedFile() {
      if (this.selectedMusicData.length === 0) {
        return this.$message.warning('请选择文件再进行批量操作')
      }
      deleteMusicBatchAPI(this.selectedMusicData)
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
    // 全屏加载函数
    openFullScreen(text) {
      return this.$loading({
        lock: true,
        text: text ? text : 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    // 页面显示条数改变事件
    handleSizeChange(val) {
      // 赋值页面显示条数
      this.pageSize = val
      // 显示条数改变重新获取用户数据
      this.initTableData()
    },
    // 页码改变事件
    handleCurrentChange(val) {
      // 页码改变
      this.pageNumber = val
      // 页码改变改变重新获取用户数据
      this.initTableData()
    },
    // 点击播放按钮处理事件
    clickPlayHandler(musicData) {
      // 请求开始播放音频 API
      startPlayMusicAPI(musicData)
        .then(async ({ data: { data } }) => {
          // 设置音频播放器播放列表
          await this.$store.dispatch('musicPlayer/setMusicList', [
            {
              ...data,
              src: `${process.env['VUE_APP_REQUEST_URL']}/apis/download/music?playMusicPath=playMusic/${this.$store.state.userProfile.userData.uno}/${data.src}`,
              pic: `${process.env['VUE_APP_REQUEST_URL']}/cover/${this.$store.state.userProfile.userData.uno}/${data.pic}`
            }
          ])
        })
        .catch(error => {
          if (error.response) {
            this.$message.error(error.response.data.message)
          }
        })
    },
    // 点击下载按钮处理事件
    async clickDownloadHandler(musicData) {
      try {
        // 请求下载音频 API
        const {
          data: { downloadPath }
        } = await downloadMusicAPI(musicData)
        downloadAPI(downloadPath).then(res => {
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
      } catch (error) {
        if (error.response) {
          this.$message.error(error.response.data.message)
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.musicManagerTable {
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

.musicManagerTable::-webkit-scrollbar {
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
</style>