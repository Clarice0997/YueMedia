<template>
  <el-form ref="registerForm" :model="registerForm" :rules="registerRules" size="medium">
    <h1>加入我们</h1>
    <el-form-item prop="username">
      <el-input v-model="registerForm.username" placeholder="账号" clearable prefix-icon="el-icon-user"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input v-model="registerForm.password" placeholder="密码" show-password prefix-icon="el-icon-lock"></el-input>
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
    <el-button class="login-button" type="primary" v-loading.fullscreen="fullscreenLoading" :loading="btnLoading" @click="clickRegisterHandler">立即注册</el-button>
    <router-link to="/login/login">已有账号？立即登录</router-link>
  </el-form>
</template>

<script>
export default {
  name: 'MusicManageSystemRegister',

  data() {
    return {
      // 表单数据对象
      registerForm: {
        username: '',
        password: '',
        nickname: '',
        phone: '',
        email: ''
      },
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
    clickRegisterHandler() {}
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
</style>
