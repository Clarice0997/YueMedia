<template>
  <div>
    <img class="wave" src="@/assets/image/wave.png" />
    <div class="bg"></div>
    <div class="container">
      <div class="img">
        <img src="@/assets/image/compose_music.svg" />
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

<style lang="less">
.wave {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 100%;
  z-index: -1;
}
.bg {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: -100;
  background-image: linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%);
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

// Responsive
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
</style>
