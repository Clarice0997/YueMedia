<template>
  <div style="width: 100%">
    <!-- 顶部操作区卡片 -->
    <el-card shadow="hover" class="top-card">
      <span>ID：</span>
      <el-input placeholder="请输入ID（模糊匹配）" clearable class="sid-input" prefix-icon="el-icon-search" v-model="searchID" @keydown.native.13="searchHandler"></el-input>
      <!-- Buttons -->
      <el-button type="primary" icon="el-icon-search" @click="searchUserHandler">查找</el-button>
      <el-button type="danger" icon="el-icon-delete" @click="batchDeleteUserHandler">批量删除</el-button>
    </el-card>
    <!-- 主体表格区卡片 -->
    <el-card shadow="hover" class="body-card">
      <userManagerTable ref="userManagerTable"></userManagerTable>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MusicManageSystemUserManagerView',

  data() {
    return {
      searchID: ''
    }
  },

  components: {
    userManagerTable: () => import('@/components/userManager/userManagerTable.vue')
  },

  mounted() {},

  methods: {
    searchUserHandler() {
      this.$refs.userManagerTable.searchUserHandler(this.searchID)
    },
    batchDeleteUserHandler() {
      this.$refs.userManagerTable.deleteUserBatchHandler()
    }
  }
}
</script>

<style lang="less" scoped>
.top-card {
  .el-input {
    width: 250px;
  }

  .el-input {
    margin-right: 20px;
  }
}

.top-card,
.body-card {
  margin: 10px;
}
</style>