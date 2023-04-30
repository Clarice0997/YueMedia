<template>
  <div>
    <el-table ref="myFileTable" :data="fileListData" :row-class-name="tableRowClassName" tooltip-effect="dark" class="myFileTable" :height="700" :max-height="700">
      <!--  ID  -->
      <el-table-column label="ID" align="center" min-width="250" prop="taskId"></el-table-column>
      <!--   任务详细   -->
      <el-table-column label="任务详情" align="center" width="200">
        <template slot-scope="scope">
          <el-popover placement="bottom" title="任务详情" width="800" trigger="hover" :content="JSON.stringify(scope.row.tasks)">
            <el-button slot="reference" size="medium">任务详情</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <!--   状态   -->
      <el-table-column label="任务状态" prop="status" width="200" sortable align="center">
        <template slot-scope="scope">
          <el-tag type="warning" v-if="scope.row.status === 1">处理中</el-tag>
          <el-tag type="success" v-else-if="scope.row.status === 2">处理完毕</el-tag>
          <el-tag type="info" v-else-if="scope.row.status === 3">过期</el-tag>
          <el-tag type="error" v-else-if="scope.row.status === 4">异常</el-tag>
        </template>
      </el-table-column>
      <!--   创建时间   -->
      <el-table-column label="创建时间" width="230" prop="createdAt" sortable align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 10px"></i>
          <span>{{ scope.row.createdAt | dateFormat }}</span>
        </template>
      </el-table-column>
      <!--   完成时间   -->
      <el-table-column label="完成时间" width="230" prop="finishedAt" align="center">
        <template slot-scope="scope" v-if="scope.row.status === 2 || scope.row.status === 3">
          <i class="el-icon-time" style="margin-right: 10px"></i>
          <span>{{ scope.row.finishedAt | dateFormat }}</span>
        </template>
      </el-table-column>
      <!--   操作列   -->
      <el-table-column label="操作" fixed="right" width="150" align="center">
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
    <!-- 分页栏 -->
    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNumber" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalData"></el-pagination>
    </div>
  </div>
</template>

<script>
import { deleteMyFileAPI, getMyFileListAPI } from '@/apis/fileAPI'
import { formatDate } from '@/utils/formatDate'
import { downloadPatchAPI } from '@/apis/downloadAPI'
import { nextTick } from 'vue'

export default {
  name: 'myFileTable',
  data() {
    return {
      fileListData: [],
      pageNumber: 1,
      pageSize: 10,
      totalData: 0
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
    // 初始化表格数据
    async initTableData() {
      const {
        data: { count, queues }
      } = await getMyFileListAPI(this.pageNumber, this.pageSize)
      this.totalData = count
      this.fileListData = queues
      nextTick(() => {
        this.$refs.myFileTable.doLayout()
      })
    },
    // 更新表格数据
    async renewTableData() {
      this.pageNumber = 1
      const {
        data: { count, queues }
      } = await getMyFileListAPI(this.pageNumber, this.pageSize)
      this.totalData = count
      this.fileListData = queues
      nextTick(() => {
        this.$refs.myFileTable.doLayout()
      })
    },
    // 判断行状态函数
    tableRowClassName({ row, rowIndex }) {
      if (row.status === 2) {
        return 'success-row'
      } else if (row.status === 4) {
        return 'warning-row'
      }
      return ''
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
          this.renewTableData()
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
    width: 20%;

    img {
      width: 30%;
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

.block {
  margin-top: 10px;
}
</style>