<template>
  <div style="width: 100%; height: 100%">
    <h1 style="margin-bottom: 5px">处理任务下载</h1>
    <el-table ref="myFileTable" :data="fileListData" tooltip-effect="dark" class="myFileTable" :height="445" :max-height="445">
      <!--  ID  -->
      <el-table-column label="ID" align="center" :min-width="110" prop="taskId"></el-table-column>
      <!--   任务详细   -->
      <el-table-column label="任务详情" align="center" :min-width="80">
        <template slot-scope="scope">
          <el-popover placement="bottom" title="任务详情" width="800" trigger="click" :content="JSON.stringify(scope.row.tasks)">
            <el-button type="primary" slot="reference" size="medium">任务详情</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <!--   操作列   -->
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <div class="handler-list">
            <a class="icon" v-if="scope.row.status === 2" @click="clickDownloadHandler(scope.row)">
              <img src="@/assets/image/icons/download_from_the_cload.svg" title="下载" alt="下载" />
            </a>
            <a class="icon" @click="clickDeleteHandler(scope.row)">
              <img src="@/assets/image/icons/delete_document.svg" title="删除" alt="删除" />
            </a>
          </div>
        </template>
      </el-table-column>
      <!--  数据为空插槽  -->
      <template slot="empty">
        <div class="empty">
          <img src="../../assets/image/icons/empty.png" alt="empty" />
          <span>暂无处理文件记录</span>
        </div>
      </template>
    </el-table>
  </div>
</template>

<script>
import { formatDate } from '@/utils/formatDate'
import { downloadPatchAPI } from '@/apis/downloadAPI'
import { deleteMyFileAPI, getMyFinishFileListAPI } from '@/apis/fileAPI'
import { nextTick } from 'vue'

export default {
  name: 'myFileTable',
  data() {
    return {
      fileListData: []
    }
  },
  filters: {
    dateFormat(value, fmt) {
      const myDate = new Date(value)
      return formatDate(myDate, fmt)
    }
  },
  async mounted() {
    await this.initTableData()
  },
  methods: {
    async initTableData() {
      const {
        data: { queues }
      } = await getMyFinishFileListAPI(this.pageNumber, this.pageSize)
      this.fileListData = queues
      nextTick(() => {
        this.$refs.myFileTable.doLayout()
      })
    },
    clickDownloadHandler(fileData) {
      downloadPatchAPI(fileData.downloadPath, 'Music Convert Patch Download')
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
    },
    async clickDeleteHandler(fileData) {
      deleteMyFileAPI(fileData.taskId)
        .then(({ data }) => {
          this.$message.success(data.message)
          this.initTableData()
        })
        .catch(error => {
          if (error.response) {
            this.$message.error(error.response.data.message)
          }
        })
    }
  }
}
</script>

<style lang="less" scoped>
.myFileTable {
  width: 100%;

  .empty {
    // 元素上下居中
    display: flex;
    flex-direction: column;
    align-items: center;
    // 居中
    margin: auto;
    text-align: center;
    width: 50%;

    img {
      width: 50%;
    }
  }
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