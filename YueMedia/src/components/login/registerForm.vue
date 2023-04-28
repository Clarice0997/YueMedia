<template>
  <el-form ref="registerForm" :model="registerForm" :rules="registerRules" size="medium" @keydown.enter.native="clickRegisterHandler" @keypress.native="preventSpecialChars">
    <div class="title">
      <h1>加入我们</h1>
    </div>
    <el-form-item prop="username">
      <el-input v-model="registerForm.username" placeholder="账号" clearable prefix-icon="el-icon-user"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="registerForm.password" placeholder="密码" show-password prefix-icon="el-icon-lock"></el-input>
    </el-form-item>
    <el-form-item prop="checkPassword">
      <el-input v-model="registerForm.checkPassword" placeholder="确认密码" show-password prefix-icon="el-icon-lock"></el-input>
    </el-form-item>
    <el-form-item prop="nickname">
      <el-input v-model="registerForm.nickname" placeholder="昵称" clearable prefix-icon="el-icon-user"></el-input>
    </el-form-item>
    <el-form-item prop="phone">
      <el-input v-model="registerForm.phone" placeholder="电话" clearable prefix-icon="el-icon-mobile-phone"></el-input>
    </el-form-item>
    <el-form-item prop="email">
      <el-input v-model="registerForm.email" placeholder="邮箱" clearable prefix-icon="el-icon-suitcase"></el-input>
    </el-form-item>
    <el-button class="login-button" type="primary" v-loading.fullscreen="fullscreenLoading" :loading="btnLoading" @click="clickRegisterHandler">立即注册 </el-button>
    <router-link to="/login/login">已有账号？立即登录</router-link>
  </el-form>
</template>

<script>
import { registerAPI } from '@/apis/loginAPI'
import router from '@/router'

export default {
  name: 'MusicManageSystemRegister',

  data() {
    return {
      // 表单数据对象
      registerForm: {
        username: '',
        password: '',
        checkPassword: '',
        nickname: '',
        phone: '',
        email: ''
      },
      // 禁用特殊字符
      specialChars: [39, 34, 59, 92, 44, 61, 40, 41, 60, 62, 123, 125, 91, 93, 43, 45, 47, 92, 37, 35, 124, 32],
      // 表单校验对象
      registerRules: {
        username: [
          // 必填项校验
          {
            required: true,
            message: '请输入账号',
            trigger: 'blur'
          },
          // 长度校验
          {
            min: 5,
            max: 20,
            message: '登录名长度在5-20字符之间',
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
        ],
        checkPassword: [
          // 必填项校验
          {
            required: true,
            message: '请输入确认密码',
            trigger: 'blur'
          },
          // 密码比对
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
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
      // Loading显隐
      fullscreenLoading: false,
      // 按钮加载状态
      btnLoading: false
    }
  },

  mounted() {},

  methods: {
    // 点击登录按钮处理函数
    clickRegisterHandler() {
      // 校验注册表单是否合法
      this.$refs.registerForm.validate(async valid => {
        if (valid) {
          // Loading遮罩
          this.fullscreenLoading = true
          // 加载按钮
          this.btnLoading = true
          // 调用注册接口
          registerAPI(this.registerForm)
            .then(async ({ data }) => {
              // 注册成功弹窗
              this.$message({
                message: data.message,
                type: 'success',
                duration: 1500
              })
              router.replace('/login/login')
            })
            .catch(({ response }) => {
              // 提示错误弹窗
              this.$message({
                message: response.data.message,
                type: 'error',
                duration: 2000
              })
            })
            .finally(() => {
              // 重置表单
              this.registerForm = this.$options.data().registerForm
              // 停止加载按钮
              this.btnLoading = false
              // 停止全屏遮罩
              this.fullscreenLoading = false
            })
        } else {
          return false
        }
      })
    },
    // 禁止输入特殊字符
    preventSpecialChars(event) {
      if (this.specialChars.includes(event.keyCode)) {
        event.preventDefault()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-form {
  transition: 0.3s;

  .el-button {
    margin: 0;
  }
}

.el-form {
  transition: 0.3s;
  width: 350px;
  font-family: 'poppins', sans-serif;
  box-sizing: content-box;
  background: rgba(255, 255, 255, 0.578);
  padding: 20px;
  border-radius: 1rem;

  a {
    display: block;
    margin-top: 10px;
    text-align: center;
    text-decoration: none;
    color: #999;
    font-size: 0.9rem;
    transition: 0.3s;
  }

  a:hover {
    color: #38d39f;
  }

  .login-button {
    width: 100%;
    border-radius: 10px;
    transition: 0.3s;
    margin-top: 22px;

    span {
      font-size: 1rem;
    }
  }
}

.el-form:hover {
  background: rgba(255, 255, 255, 0.868);
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  background: linear-gradient(45deg, #8baaaa 0%, #ae8b9c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  h1 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
}
</style>