<template>
  <div id="login-container">
    <div class="bg"></div>
    <div class="container">
      <div class="img">
        <img src="@/assets/image/compose_music.svg" alt="compose_music" />
      </div>
      <div class="login-container">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MusicManageSystemLoginView',

  data() {
    return {}
  },

  mounted() {},

  methods: {}
}
</script>

<style lang="less" scoped>
.bg {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: -100;
  background-size: cover !important;
  background-attachment: fixed !important;
  background: url('@/assets/image/bg.jpg'), no-repeat;
}

.container {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 7rem;
  padding: 0 2rem;
}

.img {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  img {
    width: 400px;
    transition: 0.3s;
  }
}

.login-container {
  transition: 0.3s;
  display: flex;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  align-items: center;
}

.el-form {
  transition: 0.3s;
  width: 350px;
  font-family: 'poppins', sans-serif;
  box-sizing: content-box;
  background: rgba(255, 255, 255, 0.578);
  padding: 20px;
  border-radius: 1rem;

  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
  }

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

// Responsive
@media screen and (min-width: 1400px) {
  .container {
    grid-gap: 1rem;
  }
}

@media screen and (max-width: 1000px) {
  .img img {
    width: 350px;
  }

  .el-form {
    width: 300px;
  }
}

@media screen and (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
    padding: 0;
  }

  .img {
    display: none;
  }

  .wave {
    display: none;
  }

  .login-content {
    justify-content: center;
  }
}

@media screen and (max-width: 500px) {
  .container {
    grid-template-columns: 1fr;
  }

  .bg {
    width: 100%;
    height: 100%;
  }

  .img {
    display: none;
  }

  .wave {
    display: none;
  }

  .login-content {
    justify-content: center;
  }

  .login-container {
    min-width: 500px;
  }
}
</style>