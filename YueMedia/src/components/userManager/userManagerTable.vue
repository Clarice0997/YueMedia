<template>
  <div style="height: 100%">
    <el-table ref="userManagerTable" :data="userData" tooltip-effect="dark" class="userManagerTable" @selection-change="handleSelectionChange" :row-class-name="tableRowClassName" height="600" max-height="700">
      <!-- 选择列 -->
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <!-- ID列 -->
      <el-table-column label="ID" width="150" align="center" prop="uno"></el-table-column>
      <!-- 账号列 -->
      <el-table-column label="账号" width="150" align="center" prop="username"></el-table-column>
      <!-- 昵称列 -->
      <el-table-column label="昵称" width="150" align="center" prop="nickname"></el-table-column>
      <!-- 存储容量使用情况列 -->
      <el-table-column label="存储容量" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.storage_size / 1024 / 1024 / 1024 }} GB</span>
        </template>
      </el-table-column>
      <!-- 存储容量使用情况列 -->
      <el-table-column label="存储容量使用情况" width="200" align="center">
        <template slot-scope="scope">
          <el-progress :percentage="scope.row.usage"></el-progress>
        </template>
      </el-table-column>
      <!--  用户状态  -->
      <el-table-column label="用户状态" width="150" sortable align="center">
        <template slot-scope="scope">
          <el-tag size="medium" type="success" v-if="scope.row.status === 1">启用</el-tag>
          <el-tag size="medium" type="danger" v-else>禁用</el-tag>
        </template>
      </el-table-column>
      <!-- 电话列 -->
      <el-table-column label="电话" width="150" align="center" prop="phone"></el-table-column>
      <!-- 邮箱列 -->
      <el-table-column label="邮箱" width="200" align="center" prop="email"></el-table-column>
      <!--  创建时间  -->
      <el-table-column label="创建时间" width="200" prop="create_time" sortable align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" style="margin-right: 10px"></i>
          <span>{{ scope.row.create_time | dateFormat }}</span>
        </template>
      </el-table-column>
      <!-- 操作列  -->
      <el-table-column label="用户操作" fixed="right" align="center" width="400">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="updateUserDataHandler(scope.row)">修改信息</el-button>
          <el-button type="primary" size="mini" @click="updateUserPasswordHandler(scope.row)">设置密码</el-button>
          <el-button type="success" size="mini" @click="updateUserStatusHandler(scope.row, 1)" v-if="scope.row.status === 2"> 启用用户 </el-button>
          <el-button type="danger" size="mini" @click="updateUserStatusHandler(scope.row, 2)" v-else>禁用用户 </el-button>
          <el-button type="danger" size="mini" @click="deleteUserHandler(scope.row)">删除用户</el-button>
        </template>
      </el-table-column>
      <template slot="empty">
        <div class="empty">
          <img src="../../assets/image/icons/empty.png" alt="empty" />
          <span>暂无用户数据</span>
        </div>
      </template>
    </el-table>
    <!-- 分页栏 -->
    <div class="block">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNumber" :page-sizes="[5, 10, 15, 20]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="totalData"></el-pagination>
    </div>
    <!-- 修改信息对话框 -->
    <el-dialog title="修改信息" :close-on-click-modal="false" :visible.sync="updateUserFormVisible" append-to-body @close="resetUpdateUserForm" width="30%">
      <el-form ref="updateUserForm" label-position="top" :model="selectedUserData" :rules="updateUserFormRules" size="medium">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="selectedUserData.nickname" placeholder="昵称" clearable prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="selectedUserData.phone" placeholder="电话" clearable prefix-icon="el-icon-mobile-phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="selectedUserData.email" placeholder="邮箱" clearable prefix-icon="el-icon-suitcase"></el-input>
        </el-form-item>
        <el-form-item label="存储空间（GB）" prop="storage_size">
          <el-slider v-model="selectedUserData.storage_size" :step="1" :max="5" show-stops></el-slider>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clickCloseUpdateUserFormDialogHandler">取 消</el-button>
        <el-button type="primary" @click="clickConfirmUpdateUserHandler">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 设置密码对话框 -->
    <el-dialog title="设置密码" :close-on-click-modal="false" destroy-on-close :visible.sync="updateUserPasswordFormVisible" append-to-body @close="resetUpdateUserPasswordForm" width="20%">
      <el-form ref="updateUserPasswordForm" :model="selectedUserData" :rules="updateUserFormRules" size="medium">
        <el-form-item label="密码" prop="password">
          <el-input v-model="selectedUserData.password" placeholder="请输入密码" show-password prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetUpdateUserPasswordForm">取 消</el-button>
        <el-button type="primary" @click="clickConfirmUpdateUserPasswordHandler">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deleteUserAPI, deleteUserBatchAPI, selectUserListAPI, updateUserDataAPI, updateUserPasswordAPI, updateUserStatusAPI } from '@/apis/userManagerAPI'
import { nextTick } from 'vue'
import { formatDate } from '@/utils/formatDate'

export default {
  name: 'userManagerTable',
  data() {
    return {
      pageNumber: 1,
      pageSize: 10,
      totalData: 0,
      // 用户数据源
      userData: [],
      // 选中列数组
      multipleSelection: [],
      updateUserFormVisible: false,
      updateUserPasswordFormVisible: false,
      selectedUserData: {},
      selectedOriginUserData: {},
      updateUserFormRules: {
        nickname: [
          // 必填项校验
          {
            required: true,
            message: '请输入昵称',
            trigger: 'blur'
          },
          // 长度校验
          {
            min: 6,
            max: 20,
            message: '昵称长度在6-20字符之间',
            trigger: 'blur'
          }
        ],
        phone: [
          // 必填项校验
          {
            required: true,
            message: '请输入电话',
            trigger: 'blur'
          },
          // 长度校验
          {
            pattern: /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/,
            message: '电话格式不正确',
            trigger: 'blur'
          }
        ],
        email: [
          // 必填项校验
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          // 长度校验
          {
            pattern: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
            message: '邮箱格式不正确',
            trigger: 'blur'
          }
        ],
        password: [
          // 必填项校验
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          // 长度校验
          {
            min: 6,
            max: 20,
            message: '登录密码长度在6-20字符之间',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    selectedUserData() {
      this.selectedUserData.storage_size = this.selectedUserData.storage_size / 1024 / 1024 / 1024
      this.selectedOriginUserData.storage_size = this.selectedOriginUserData.storage_size / 1024 / 1024 / 1024
    }
  },
  computed: {},
  filters: {
    dateFormat(value, fmt = 'yyyy年MM月dd日') {
      const myDate = new Date(value)
      return formatDate(myDate, fmt)
    },
    calculateFileSize(value) {
      return value / 1024 / 1024 / 1024
    }
  },
  async mounted() {
    await this.initTableData()
  },
  methods: {
    // 初始化表格数据
    async initTableData() {
      const {
        data: { count, userData }
      } = await selectUserListAPI(this.pageNumber, this.pageSize)
      this.totalData = count
      this.userData = userData
      this.$refs.userManagerTable.doLayout()
    },
    // 根据 ID 搜索用户
    async searchUserHandler(uno) {
      const {
        data: { count, userData }
      } = await selectUserListAPI(this.pageNumber, this.pageSize, uno)
      this.totalData = count
      this.userData = userData
      nextTick(() => {
        this.$refs.userManagerTable.doLayout()
      })
    },
    // 更新表格数据
    async renewTableData() {
      this.pageNumber = 1
      const {
        data: { count, userData }
      } = await selectUserListAPI(this.pageNumber, this.pageSize)
      this.totalData = count
      this.userData = userData
      nextTick(() => {
        this.$refs.userManagerTable.doLayout()
      })
    },
    // 判断行状态函数
    tableRowClassName({ row, rowIndex }) {
      if (row.status === 2) {
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
    // 选择列数据事件
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    // 页码改变事件
    handleCurrentChange(val) {
      // 页码改变
      this.pageNumber = val
      // 页码改变改变重新获取用户数据
      this.initTableData()
    },
    updateUserDataHandler(userData) {
      this.selectedUserData = JSON.parse(JSON.stringify(userData))
      this.selectedOriginUserData = JSON.parse(JSON.stringify(userData))
      this.updateUserFormVisible = true
    },
    updateUserPasswordHandler(userData) {
      this.selectedUserData = JSON.parse(JSON.stringify(userData))
      this.selectedOriginUserData = JSON.parse(JSON.stringify(userData))
      this.updateUserPasswordFormVisible = true
    },
    resetUpdateUserForm() {
      this.selectedUserData = {}
      this.selectedOriginUserData = {}
    },
    clickCloseUpdateUserFormDialogHandler() {
      this.updateUserFormVisible = false
      this.resetUpdateUserForm()
    },
    resetUpdateUserPasswordForm() {
      this.updateUserPasswordFormVisible = false
      this.resetUpdateUserForm()
    },
    async clickConfirmUpdateUserHandler() {
      // 判断数据是否改变
      if (
        this.selectedUserData.nickname === this.selectedOriginUserData.nickname &&
        this.selectedUserData.phone === this.selectedOriginUserData.phone &&
        this.selectedUserData.email === this.selectedOriginUserData.email &&
        this.selectedUserData.storage_size === this.selectedOriginUserData.storage_size
      ) {
        this.$message.warning('数据没有改变')
        this.clickCloseUpdateUserFormDialogHandler()
      } else {
        const filterData = {
          nickname: this.selectedUserData.nickname !== this.selectedOriginUserData.nickname ? this.selectedUserData.nickname : undefined,
          phone: this.selectedUserData.phone !== this.selectedOriginUserData.phone ? this.selectedUserData.phone : undefined,
          email: this.selectedUserData.email !== this.selectedOriginUserData.email ? this.selectedUserData.email : undefined,
          storage: this.selectedUserData.storage_size !== this.selectedOriginUserData.storage_size ? this.selectedUserData.storage_size * 1024 * 1024 * 1024 : undefined
        }
        updateUserDataAPI(filterData, this.selectedUserData.uno)
          .then(({ data }) => {
            this.$message.success(data.message)
            this.initTableData()
          })
          .catch(error => {
            if (error.response) this.$message.error(error.response.data.message)
          })
          .finally(() => {
            this.clickCloseUpdateUserFormDialogHandler()
          })
      }
    },
    async clickConfirmUpdateUserPasswordHandler() {
      updateUserPasswordAPI(this.selectedUserData.password, this.selectedUserData.uno)
        .then(({ data }) => {
          this.$message.success(data.message)
          this.initTableData()
        })
        .catch(error => {
          if (error.response) this.$message.error(error.response.data.message)
        })
        .finally(() => {
          this.resetUpdateUserPasswordForm()
        })
    },
    async updateUserStatusHandler(userData, targetStatus) {
      updateUserStatusAPI(targetStatus, userData.uno)
        .then(({ data }) => {
          this.$message.success(data.message)
          this.initTableData()
        })
        .catch(error => {
          if (error.response) this.$message.error(error.response.data.message)
        })
        .finally(() => {
          this.resetUpdateUserPasswordForm()
        })
    },
    async deleteUserHandler(userData) {
      deleteUserAPI(userData.uno)
        .then(({ data }) => {
          this.$message.success(data.message)
          this.initTableData()
        })
        .catch(error => {
          if (error.response) this.$message.error(error.response.data.message)
        })
        .finally(() => {
          this.resetUpdateUserPasswordForm()
        })
    },
    async deleteUserBatchHandler() {
      if (this.multipleSelection.length === 0) return this.$message.warning('请选择用户')
      // 批量删除
      deleteUserBatchAPI(this.multipleSelection.map(item => item.uno))
        .then(({ data }) => {
          this.$message.success(data.message)
          this.initTableData()
        })
        .catch(error => {
          if (error.response) this.$message.error(error.response.data.message)
        })
        .finally(() => {
          this.resetUpdateUserPasswordForm()
        })
    }
  }
}
</script>

<style lang="less" scoped>
.userManagerTable {
  width: 100%;

  button {
    margin-right: 5px;
  }
}

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

.block {
  margin-top: 10px;
}
</style>