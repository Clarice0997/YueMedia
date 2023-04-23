<template>
  <div>
    <el-table ref="musicManagerTable" :data="musicData" tooltip-effect="dark" class="musicManagerTable" :row-class-name="tableRowClassName" max-height="900" :default-sort="{ prop: 'create_time', order: 'descending' }">
      <!--  选择列  -->
      <el-table-column type="selection" width="55" align="center"></el-table-column>
      <!--  音频 ID  -->
      <el-table-column label="ID" align="center" prop="song_id" sortable></el-table-column>
      <!--  音频名列  -->
      <el-table-column label="音频名" prop="song_name" align="center"></el-table-column>
      <!--  专辑名   -->
      <el-table-column label="专辑名" prop="album_name" sortable align="center"></el-table-column>
      <!--  歌手   -->
      <el-table-column label="歌手" prop="singer_name" sortable align="center"></el-table-column>
      <!--  音频状态   -->
      <el-table-column label="音频状态" prop="status" sortable align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="warning" v-if="scope.row.status === 1">私有</el-tag>
          <el-tag size="medium" type="success" v-else>公开</el-tag>
        </template>
      </el-table-column>
      <!--  音频编码格式  -->
      <el-table-column label="编码格式" prop="music_codec" sortable align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="success">{{ scope.row.music_codec }}</el-tag>
        </template>
      </el-table-column>
      <!--  创建时间  -->
      <el-table-column label="创建时间" width="180" prop="create_time" sortable align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 10px"></i>
          <span>{{ scope.row.create_time | dateFormat }}</span>
        </template>
      </el-table-column>
      <!--  文件大小  -->
      <el-table-column label="文件大小" prop="song_size" sortable align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.song_size / 1024 / 1024) | numToFixed }} MB</span>
        </template>
      </el-table-column>
      <!--  年份  -->
      <el-table-column label="年份" prop="year" sortable align="center"></el-table-column>
      <!--   TODO: 操作栏   -->
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
import { selectMusicListAPI } from '@/apis/musicAPI'
import { formatDate } from '@/utils/formatDate'

export default {
  name: 'musicManagerTable',
  data() {
    return {
      musicData: [],
      pageNumber: 1,
      pageSize: 5,
      totalData: 0
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
    // 选择表格样式变化
    tableRowClassName({ row, rowIndex }) {
      if (!row.audited) {
        return 'warning-row'
      }
      return ''
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

.block {
  margin-top: 10px;
}
</style>