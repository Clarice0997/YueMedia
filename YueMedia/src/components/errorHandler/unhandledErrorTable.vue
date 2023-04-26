<template>
  <div>
    <el-table ref="unhandledErrorTable" :data="currentUnhandledErrorTableData" :height="400" :max-height="400" tooltip-effect="dark" class="unhandledErrorTable">
      <el-table-column label="ID" width="220" align="center" prop="_id"></el-table-column>
      <el-table-column label="错误信息" width="250" align="center" prop="message">
        <template slot-scope="scope">
          <el-popover placement="bottom" title="错误信息" width="800" trigger="hover" :content="scope.row.message">
            <el-button slot="reference">错误信息</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="错误类型" align="center" prop="name"></el-table-column>
      <el-table-column label="错误日期" align="center" sortable>
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 10px"></i>
          <span>{{ scope.row.date | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="详细错误信息" align="center">
        <template slot-scope="scope">
          <el-popover placement="bottom" title="详细错误信息" width="800" trigger="hover" :content="scope.row.stack">
            <el-button slot="reference">错误栈</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <!-- 操作列  -->
      <el-table-column label="操作" fixed="right" width="300" align="center">
        <template slot-scope="scope">
          <el-button type="success" @click="clickStatusChangeHandler(scope.row, 1)">已处理</el-button>
          <el-button size="warning" @click="clickStatusChangeHandler(scope.row, 2)">标记</el-button>
          <el-button type="info" @click="clickStatusChangeHandler(scope.row, 3)">忽略</el-button>
        </template>
      </el-table-column>
      <!--  数据为空插槽  -->
      <template slot="empty">
        <div class="empty">
          <img src="../../assets/image/icons/empty.png" alt="empty" />
          <span>暂无未处理错误数据</span>
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
import { getErrorsAPI, updateErrorAPI } from '@/apis/errorAPI'
import { formatDate } from '@/utils/formatDate'

export default {
  name: 'unhandledErrorTable',
  data() {
    return {
      unhandledErrorTableData: [],
      pageNumber: 1,
      pageSize: 5
    }
  },
  computed: {
    currentUnhandledErrorTableData() {
      return this.unhandledErrorTableData.slice((this.pageNumber - 1) * this.pageSize, (this.pageNumber - 1) * this.pageSize + this.pageSize)
    },
    totalData() {
      return this.unhandledErrorTableData.length
    }
  },
  filters: {
    dateFormat(value, fmt = 'yyyy年MM月dd日') {
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
        data: { errors }
      } = await getErrorsAPI(0)
      this.unhandledErrorTableData = errors
    },
    // 更新表格数据
    async renewTableData() {
      this.pageNumber = 1
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
    // 点击状态改变按钮处理事件
    async clickStatusChangeHandler(data, status) {
      const {
        data: { message }
      } = await updateErrorAPI(data._id, status)
      this.$message({ message, duration: 1000, type: 'success' })
      this.$emit('renewTableData')
    }
  }
}
</script>

<style lang="less" scoped>
.unhandledErrorTable {
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

.block {
  margin-top: 10px;
}
</style>