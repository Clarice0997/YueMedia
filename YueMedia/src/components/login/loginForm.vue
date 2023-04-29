<template>
  <el-form ref="form" :model="form" :rules="rules" size="medium" @keydown.enter.native="clickLoginHandler" @keypress.native="preventSpecialChars">
    <div class="title">
      <h1>悦音 - 媒体管理一站式平台</h1>
    </div>
    <el-form-item prop="username">
      <el-input v-model="form.username" placeholder="账号" clearable prefix-icon="el-icon-user"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="form.password" placeholder="密码" show-password prefix-icon="el-icon-lock"></el-input>
    </el-form-item>
    <div class="safecode-container">
      <img :src="captchaSrc" class="safecode-img" @click="clickRefreshCaptcha" alt="验证码" />
      <el-form-item prop="safecode">
        <el-input v-model="form.safecode" placeholder="验证码"></el-input>
      </el-form-item>
    </div>
    <el-button class="login-button" type="primary" :loading="btnLoading" @click="clickLoginHandler">立即登录</el-button>
    <router-link to="/login/register">立即注册</router-link>
  </el-form>
</template>

<script>
// import modules
import { loginAPI, validateSafeCodeAPI } from '@/apis/loginAPI'
import router from '@/router'

export default {
  name: 'MusicManageSystemLogin',

  data() {
    return {
      loading: '',
      // 表单数据对象
      form: {
        username: '',
        password: '',
        safecode: ''
      },
      // 禁用特殊字符
      specialChars: [39, 34, 59, 92, 44, 61, 40, 41, 60, 62, 123, 125, 91, 93, 43, 45, 47, 92, 37, 35, 124, 32],
      // 表单校验对象
      rules: {
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
        safecode: [
          // 必填项校验
          {
            required: true,
            message: '验证码不为空',
            trigger: 'blur'
          },
          // 长度校验
          {
            max: 4,
            trigger: 'blur'
          }
        ]
      },
      // 按钮加载状态
      btnLoading: false,
      // 验证码地址
      captchaSrc: `${process.env.VUE_APP_REQUEST_URL}/apis/safecode`
    }
  },

  mounted() {},

  beforeDestroy() {
    if (this.loading) {
      this.loading.close()
    }
  },

  methods: {
    // 刷新验证码函数
    clickRefreshCaptcha() {
      this.captchaSrc = `${process.env.VUE_APP_REQUEST_URL}/apis/safecode?timestamp=${new Date().getTime()}`
    },
    // 点击登录按钮处理函数
    clickLoginHandler() {
      // 校验登录表单是否合法
      this.$refs.form.validate(async valid => {
        if (valid) {
          // 防止移动端登录
          if (/Android|webOS|iPhone|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // 重置表单
            this.form = this.$options.data().form
            return this.$message.error('不支持使用移动设备或宽高比过低的设备登录')
          }
          // 防止宽高比过低的设备登录
          if (window.screen.width <= 480 || window.screen.height <= 480) {
            // 重置表单
            this.form = this.$options.data().form
            return this.$message.error('不支持使用移动设备或宽高比过低的设备登录')
          }
          // Loading遮罩
          this.loading = this.openFullScreen('登录中...')
          // 加载按钮
          this.btnLoading = true

          // 验证验证码是否正确
          try {
            await validateSafeCodeAPI(this.form.safecode)
          } catch ({ response }) {
            // 验证码错误弹窗
            this.$message({
              message: response.data.message,
              type: 'error',
              duration: 2000
            })
            // 刷新验证码
            this.clickRefreshCaptcha()
            // 重置表单
            this.form = this.$options.data().form
            // 停止加载按钮
            this.btnLoading = false
            // 停止全屏遮罩
            this.loading.close()
            return false
          }

          // 验证码正确则调用登录 API
          loginAPI(this.form.username, this.form.password)
            .then(async ({ data }) => {
              // 保存 JsonWebToken
              await localStorage.setItem('Access-Token', data.token)
              // 登录成功弹窗
              this.$message({
                message: data.message,
                type: 'success',
                duration: 1000
              })
              router.replace('/home')
            })
            .catch(({ response }) => {
              // 提示错误弹窗
              this.$message({
                message: response.data.message,
                type: 'error',
                duration: 2000
              })
              // 停止 Loading
              this.loading.close()
            })
            .finally(() => {
              // 刷新验证码
              this.clickRefreshCaptcha()
              // 重置表单
              this.form = this.$options.data().form
              // 停止加载按钮
              this.btnLoading = false
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
    },
    // 全屏加载函数
    openFullScreen(text) {
      return this.$loading({
        lock: true,
        text: text ? text : 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
  }
}
</script>

<style lang="less" scoped>
.safecode-container {
  display: grid;
  grid-template-columns: 30% 70%;

  img {
    height: 100%;
    background-color: #eef7f8;
    cursor: pointer;
  }

  .el-form-item {
    margin: 0;
    padding-left: 5px;
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
  font-family: 'poppins', sans-serif;
  box-sizing: content-box;
  border-radius: 1rem;
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