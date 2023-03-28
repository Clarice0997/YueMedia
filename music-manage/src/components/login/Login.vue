<template>
  <el-form ref="form" :model="form" :rules="rules" size="medium">
    <h1>登录悦音</h1>
    <el-form-item prop="username">
      <el-input v-model="form.username" placeholder="账号" clearable prefix-icon="el-icon-user"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="form.password" placeholder="密码" show-password prefix-icon="el-icon-lock"></el-input>
    </el-form-item>
    <div class="safecode-container">
      <img src="http://localhost:3000/apis/safecode?type=math" class="safecode-img" />
      <el-form-item prop="safecode">
        <el-input v-model="form.safecode" placeholder="验证码"></el-input>
      </el-form-item>
    </div>
    <el-button class="login-button" type="primary" v-loading.fullscreen="fullscreenLoading" :loading="btnLoading" @click="clickLoginHandler">立即登录</el-button>
    <router-link to="/login/register">立即注册</router-link>
  </el-form>
</template>

<script>
export default {
  name: 'MusicManageSystemLogin',

  data() {
    return {
      // 表单数据对象
      form: {
        username: '',
        password: '',
        safecode: ''
      },
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
            min: 6,
            max: 20,
            message: '登录名长度在6-20字符之间',
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
      // Loading显隐
      fullscreenLoading: false,
      // 按钮加载状态
      btnLoading: false
    }
  },

  mounted() {},

  methods: {
    // 点击登录按钮处理函数
    clickLoginHandler() {}
  }
}
</script>

<style lang="less" scoped>
.safecode-container {
  display: grid;
  grid-template-columns: 30% 70%;
  img {
    height: 100%;
  }
  .el-form-item {
    margin: 0;
    padding-left: 5px;
  }
}
</style>
