<template>
  <div class="introduction_container">
    <header class="header-container">
      <div class="header-wrapper">
        <div class="header-main">
          <div class="container">
            <div class="header-inner">
              <div class="logo">
                <img src="@/assets/image/icons/music.svg" />
                <p>YueYin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    <div class="main-container">
      <div class="content-box">
        <div class="title">
          <h1>悦音 - 媒体管理一站式平台</h1>
          <h2>助力用户高效便捷地完成媒体管理的全部工作</h2>
        </div>
        <div class="start">
          <button class="btn transparent" id="sign-up-btn" @click="routeToLogin">快速上手</button>
        </div>
      </div>
    </div>
    <div class="describe-container">
      <div class="describe-content">
        <div class="content-block">
          <p class="icon">
            <img src="@/assets/image/icons/WORLDWIDECOVERAGE.svg" />
          </p>
          <p class="title">在线平台</p>
          <p class="content">使用该平台不需要下载和安装任何东西到您的设备上，可以在任何操作系统（Windows、Mac 或 Linux）上通过您喜欢的浏览器使用在线工具。</p>
        </div>
        <div class="content-block">
          <p class="icon">
            <img src="@/assets/image/icons/SECURE.svg" />
          </p>
          <p class="title">数据安全</p>
          <p class="content">平台保证数据的安全性，所有通信都通过安全通道进行。在转换完成后，会立即删除您的源文件，没有人可以访问它们。这意味着您可以安全地上传和处理您的媒体文件，而不必担心数据泄露或安全问题。</p>
        </div>
        <div class="content-block">
          <p class="icon">
            <img src="@/assets/image/icons/AIAPPLICATIONS.svg" />
          </p>
          <p class="title">多媒体存储</p>
          <p class="content">平台提供了大量的存储空间，以便您存储和管理您的媒体文件。您可以将文件上传到云存储中，并随时随地访问它们。</p>
        </div>
        <div class="content-block">
          <p class="icon">
            <img src="@/assets/image/icons/API.svg" />
          </p>
          <p class="title">便捷的API服务</p>
          <p class="content">平台提供了便捷的API服务，这意味着您可以使用API将该工具集成到您的应用程序或工作流中，以便更高效地管理媒体文件，同时提供多种数据分析支持。</p>
        </div>
        <div class="content-block">
          <p class="icon">
            <img src="@/assets/image/icons/BIGDATA.svg" />
          </p>
          <p class="title">格式转换</p>
          <p class="content">平台提供了快速的格式转换工具，支持主流数据格式，包括MP3，WAV，FLAC，AAC，OGG等，以及部分加密数据格式。无论您需要将音频格式从一个格式转换为另一格式，还是解密音频数据，该工具都可以帮助您快速完成。</p>
        </div>
        <div class="content-block">
          <p class="icon">
            <img src="@/assets/image/icons/SHARE.svg" />
          </p>
          <p class="title">内容分享</p>
          <p class="content">平台结合分享短链功能，旨在为用户提供音乐分享，帮助用户拓展自己的音乐圈子、发现新音乐、推广自己的音乐和获得反馈和建议。如果您是一个音乐爱好者，那么音乐分享功能将帮助您更好地享受音乐之旅。</p>
        </div>
      </div>
    </div>
    <footer>
      <div class="container">
        <div class="footer-content">
          <p>版权所有@悦音 2023</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'introduction',
  methods: {
    routeToLogin() {
      this.$router.replace('/login/login')
    }
  }
}
</script>

<style scoped lang="less">
.introduction_container {
  min-width: 1400px;
}

.header-container {
  font-family: Inter, sans-serif;
  z-index: 10;
  width: 100%;
  color: #262628;
  user-select: none;

  .header-wrapper {
    min-height: 60px;
    box-sizing: border-box;
  }
}

.header-main {
  padding-top: 13px;
  padding-bottom: 13px;
  width: 100%;
  position: relative;
  background-color: #fff;
  box-shadow: 0 1px 0 0 rgba(38, 38, 40, 0.09);
  transition: top 0.3s ease-out, padding 0.2s ease-out;

  .container {
    max-width: none !important;
    padding-left: 30px;
    padding-right: 30px;
    width: 100%;
  }
}

.header-inner {
  display: flex;
  position: relative;
  justify-content: space-between;

  .logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: 0.3s;

    img {
      width: 32px;
      height: 32px;
      margin-right: 10px;
    }

    p {
      font-size: 28px;
      font-weight: bold;
    }
  }

  .logo:hover {
    opacity: 0.6;
  }
}

.main-container {
  padding: 100px 30px 35px;
  margin: 0 140px;

  .content-box {
    display: flex;
    flex-direction: column;
    align-items: center;

    .title {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 50px;
    }

    h1 {
      font-family: '阿里妈妈东方大楷 Regular', sans-serif;
      font-size: 3rem;
      font-weight: 300;
      margin-bottom: 28px;
      background: linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    h2 {
      font-family: '阿里妈妈东方大楷 Regular', sans-serif;
      font-size: 1.5rem;
      font-weight: 200;
    }
  }

  .start {
    .btn {
      font-family: '阿里巴巴普惠体 2.0 65 Medium', sans-serif;
      font-size: 18px;
      width: 180px;
      background-color: #5995fd;
      border: none;
      outline: none;
      height: 49px;
      border-radius: 49px;
      color: #fff;
      text-transform: uppercase;
      font-weight: 600;
      margin: 10px 0;
      cursor: pointer;
      transition: 0.5s;
    }

    .btn:hover {
      background-color: #4d84e2;
    }
  }
}

.describe-container {
  padding: 100px 30px;
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;

  .describe-content {
    margin-bottom: -65px;
    display: flex;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
    -webkit-box-pack: center !important;
    justify-content: center !important;

    .content-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 40px;
      margin-bottom: 65px;
      text-align: center !important;
      -webkit-box-flex: 0;
      flex: 0 0 33.3333333333%;
      max-width: 33.3333333333%;

      .icon {
        margin-bottom: 8px;
        height: 40px;

        img {
          width: 40px;
          height: 40px;
        }
      }

      p {
        font-family: '阿里巴巴普惠体 2.0 65 Medium', sans-serif;
      }

      .title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 12px;
        background: linear-gradient(to right, #92fe9d 0%, #00c9ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .content {
        text-indent: 2px;
        font-weight: normal;
      }
    }
  }
}

footer {
  border-top: 1px solid rgba(38, 38, 40, 0.09);
  background-color: #fff;
  font-size: 13px;
  line-height: 22px;
  height: 60px;

  .container {
    height: 100%;
    display: flex;
    justify-content: center;

    .footer-content {
      display: flex;
      align-items: center;

      p {
        font-family: '阿里巴巴普惠体 2.0 65 Medium', sans-serif;
        font-size: 16px;
        color: #2d2d2d;
      }
    }
  }
}
</style>