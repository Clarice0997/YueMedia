<template>
  <div style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: 10px">
    <div class="user-detail-form user-form">
      <h1>用户信息修改</h1>
      <el-form ref="userDetailForm" class="form" :model="userDetailData" :rules="userDetailRules">
        <el-form-item prop="nickname">
          <el-input v-model="userDetailData.nickname" placeholder="昵称" clearable prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="userDetailData.phone" placeholder="电话" clearable prefix-icon="el-icon-mobile-phone"></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="userDetailData.email" placeholder="邮箱" clearable prefix-icon="el-icon-suitcase"></el-input>
        </el-form-item>
        <el-button style="width: 100%" type="primary" @click="updateUserDataHandler">修改信息</el-button>
      </el-form>
    </div>
    <div class="user-password-form user-form" style="margin-top: 50px">
      <h1>登录密码修改</h1>
      <el-form ref="userPasswordForm" class="form" :model="userPasswordData" :rules="userPasswordRules" size="medium">
        <el-form-item prop="password">
          <el-input v-model="userPasswordData.password" placeholder="密码" show-password prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input v-model="userPasswordData.newPassword" placeholder="新密码" show-password prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <el-button style="width: 100%" type="primary" @click="updatePasswordHandler">修改密码</el-button>
      </el-form>
    </div>
  </div>
</template>

<script>
import { updateUserDataAPI, updateUserPasswordAPI } from '@/apis/userAPI'
import store from '@/store'

export default {
  name: 'userDetail',
  data() {
    return {
      userDetailData: {
        nickname: this.$store.state.userProfile.userData.nickname,
        phone: '',
        email: ''
      },
      userDetailRules: {
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
        ]
      },
      userPasswordData: {
        password: '',
        newPassword: ''
      },
      userPasswordRules: {
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
        ],
        newPassword: [
          // 必填项校验
          {
            required: true,
            message: '请输入新密码',
            trigger: 'blur'
          },
          // 密码相同校验
          {
            validator: (rule, value, callback) => {
              if (value === this.userPasswordData.password) {
                callback(new Error('两次输入密码不能相同!'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 修改用户信息
    updateUserDataHandler() {
      this.$refs.userDetailForm.validate(async valid => {
        if (valid) {
          updateUserDataAPI(this.userDetailData)
            .then(async ({ data }) => {
              this.$message.success(data.message)
              // 重新设置用户信息
              await store.dispatch('userProfile/saveUserData', {
                ...this.$store.state.userProfile.userData,
                nickname: this.userDetailData.nickname
              })
              // 关闭 Drawer
              this.$emit('hideDrawer')
            })
            .catch(error => {
              if (error.response) {
                this.$message.error(error.response.data.message)
              }
            })
            .finally(() => {
              // 重置用户信息对象
              this.userDetailData = {}
            })
        } else {
          return false
        }
      })
    },
    // 修改用户密码
    updatePasswordHandler() {
      this.$refs.userPasswordForm.validate(async valid => {
        if (valid) {
          updateUserPasswordAPI(this.userPasswordData.password, this.userPasswordData.newPassword)
            .then(({ data }) => {
              this.$message.success(data.message)
              // 修改密码成功 退出登录
              this.$emit('logoutHandler')
            })
            .catch(error => {
              if (error.response) {
                this.$message.error(error.response.data.message)
              }
            })
            .finally(() => {
              // 重置数据对象
              this.userPasswordData = {}
            })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.user-form {
  margin: 10px;
}

h1 {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin: 10px;
}

.form {
  padding: 10px;
}
</style>