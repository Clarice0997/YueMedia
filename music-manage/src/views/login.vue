<template>
  <div class="login">
    <div class="login-title">
      <span>ktv点歌管理系统</span>
    </div>
    <div class="form-box">
      <el-form class="login-form" label-position="top" size="small" :inline-message="inline" :model="loginForm" status-icon :rules="loginRule" ref="loginForm">
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" v-model="loginForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="loginForm.password" show-password placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item label="验证码" prop="inputCaptcha">
          <div class="capture_code">
            <el-input style="width: 150px" v-model="loginForm.inputCaptcha" placeholder="验证码"></el-input>
            <img width="80" style="background: #eee9e9; margin-left: 30px; cursor: pointer" height="32" :src="captureSrc" @click="refreshCaptcha" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button class="login-btn" type="primary" @click="submitForm('loginForm')">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicManageSystemLogin',

  data() {
    // 校验验证码的输入
    const validateCapcha = (rule, value, callback) => {
      console.log('this.loginForm.inputCaptcha=>', typeof this.loginForm.inputCaptcha)
      if (!this.loginForm.inputCaptcha.trim()) {
        // 验证码为空或者用户没有输入，需要注意：用户有可能会输入几个空格之后再输入验证码
        callback(new Error('请输入验证码~'))
      } else {
        callback() // 校验通过的情况，要开发callback的出口
      }
    }

    return {
      inline: true,
      loginForm: {
        email: '279167901@qq.com',
        password: '123456',
        inputCaptcha: ''
      },
      loginRule: {
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6-20之间', trigger: 'blur' }
        ],
        inputCaptcha: [{ required: true, validator: validateCapcha, trigger: 'blur' }]
      },
      captureSrc: ''
    }
  },

  methods: {
    // 提交登录表单
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          console.log('valid')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 重置登录表单
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    // 初始化验证码
    initCaptcha() {
      this.captureSrc = `http://localhost:3000/apis/safecode?time${new Date()}`
    },

    // 重置验证码
    refreshCaptcha() {
      this.captureSrc = `http://localhost:3000/apis/safecode?time${new Date()}`
    }
  },

  mounted() {
    this.initCaptcha()
  }
}
</script>

<style lang="less" scoped>
.login {
  width: 100%;
  height: 100vh;
  cursor: default;
  padding: 40px 0px;
  color: red;
  background-image: url('../assets/image/login-bg.jpg');
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;

  .login-title {
    width: 100%;
    height: 150px;
    line-height: 150px;
    text-align: center;
    font-size: 40px;
    color: aliceblue;
    font-family: '隶书';
  }

  .form-box {
    width: 100%;

    .login-form {
      width: 300px;
      margin: 0 auto;
      background-color: rgba(255, 255, 255, 0.9);
      border: 1px solid #cdcdcd;
      padding: 10px 15px;
      border-radius: 5px;

      .login-btn {
        width: 100%;
        background: linear-gradient(to bottom, rgba(47, 228, 89, 0.9), #27a744); // 线性渐变
        font-weight: 600;
      }

      .login-btn:hover {
        background: rgb(94, 255, 132);
      }

      // 验证码
      .capture_code {
        display: flex;
        align-items: center;
        justify-content: space-between;

        input {
          // width: 160px;
          height: 32px;
          outline: none;
          border: 1px solid #eee;
          padding: 2px 15px;
          border-radius: 5px;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
