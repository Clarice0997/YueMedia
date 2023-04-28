<template>
  <el-dialog title="选择我的音频" :visible.sync="localDialogSelectMusicTableVisible" append-to-body @close="resetSelectMusicTable">
    <el-table ref="selectMusicTable" :data="musicData" @selection-change="handleSelectionChange" max-height="900" tooltip-effect="dark" class="selectMusicTable">
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
      <!--  音频编码格式  -->
      <el-table-column label="编码格式" prop="music_codec" min-width="200" sortable align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="success">{{ scope.row.music_codec }}</el-tag>
        </template>
      </el-table-column>
      <!--  文件大小  -->
      <el-table-column label="文件大小" width="150" prop="song_size" sortable align="center">
        <template slot-scope="scope">
          <span>{{ (scope.row.song_size / 1024 / 1024) | numToFixed }} MB</span>
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
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNumber" :page-size="pageSize" layout="total, prev, pager, next, jumper" :total="totalData"></el-pagination>
    </div>
    <!--  底部操作栏  -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="resetSelectMusicTable">取 消</el-button>
      <el-button type="primary" :disabled="!isSelectMusic" @click="clickConfirmSelectMusicHandler">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import store from '@/store'
import { selectMusicListAPI } from '@/apis/musicAPI'

export default {
  name: 'selectMusicTable',
  props: {
    dialogSelectMusicTableVisible: {
      type: Boolean,
      default: false,
      require: true
    }
  },
  data() {
    return {
      localDialogSelectMusicTableVisible: this.dialogSelectMusicTableVisible,
      musicData: [],
      selectedMusicData: [],
      isSelectMusic: false,
      pageNumber: 1,
      pageSize: 5,
      totalData: 0
    }
  },
  watch: {
    dialogSelectMusicTableVisible(newValue) {
      this.localDialogSelectMusicTableVisible = newValue
      this.initTableData()
    },
    selectedMusicData(newValue) {
      this.isSelectMusic = newValue.length !== 0
    }
  },
  filters: {
    concatCoverUrl(value) {
      if (!value) return
      return `${process.env['VUE_APP_REQUEST_URL']}/cover/${store.state['userProfile'].userData.uno}/${value}`
    },
    numToFixed(value, fixed = 2) {
      if (value !== undefined && value !== null) {
        return value.toFixed(fixed)
      } else {
        return 'N/A'
      }
    }
  },
  async mounted() {
    await this.initTableData()
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
      this.pageNumber = 1
      const {
        data: { count, musicData }
      } = await selectMusicListAPI(this.pageNumber, this.pageSize)
      this.totalData = count
      this.musicData = musicData
    },
    resetSelectMusicTable() {
      // 重置数据
      this.musicData = []
      this.selectedMusicData = []
      this.isSelectMusic = false
      this.$emit('closeSelectMusicTable')
    },
    // 选择列改变事件
    handleSelectionChange(val) {
      this.selectedMusicData = val
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
    clickConfirmSelectMusicHandler() {
      this.$emit('uploadSelectFile', this.selectedMusicData)
    }
  }
}
</script>

<style lang="less" scoped>
.selectMusicTable {
  width: 100%;

  .empty {
    // 元素上下居中
    display: flex;
    flex-direction: column;
    align-items: center;
    // 居中
    margin: 20px auto;
    text-align: center;
    width: 20%;

    img {
      width: 30%;
    }
  }
}

.selectMusicTable::-webkit-scrollbar {
  display: block;
}

.block {
  margin-top: 10px;
}
</style>