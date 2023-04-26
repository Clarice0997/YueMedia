<template>
  <div style="height: 100%">
    <el-container>
      <el-header>
        <div class="logo-container">
          <div class="logo" @click="clickLogoHandler">
            <h3>悦音 - 媒体管理一站式平台</h3>
          </div>
          <div class="toggle-container" @click="toggleClick">
            <i :class="toggleClass"></i>
          </div>
        </div>
        <div class="user-container">
          <div class="userInfo" @click="isShowUserForm = true">
            <i class="el-icon-user"></i>
          </div>
          <div class="logout" @click="clickLogoutHandler">
            <i class="el-icon-switch-button"></i>
          </div>
        </div>
      </el-header>
      <el-container class="body-container">
        <el-aside :width="asideWidth" ref="elAside">
          <el-menu v-for="(item, index) in menuList" :key="index" :default-active="$route.path" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b" router>
            <el-menu-item :index="item.index">
              <i :class="item.icon"></i>
              <span slot="title">{{ item.title }}</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <div class="main-container">
            <router-view></router-view>
          </div>
          <p class="footer">版权所有@悦音 2023</p>
        </el-main>
      </el-container>
    </el-container>
    <div class="page-bg"></div>
    <el-drawer title="用户信息" :visible.sync="isShowUserForm" direction="rtl" size="20%" destroy-on-close>
      <userDetail ref="userDetail" @hideDrawer="hideDrawer" @logoutHandler="clickLogoutHandler"></userDetail>
    </el-drawer>
    <!--  TODO: 删除音乐列表，需要修改原组件，尝试使用 patch-package  -->
    <a-player :music="audio[0]" :list="audio" :volume="0.2" listFolded repeat="repeat-all" />
  </div>
</template>

<script>
// import modules
import store from '@/store'
import { deleteCookie } from '@/utils/cookie'
import APlayer from 'vue-aplayer'
import { resetRouter } from '@/utils/routeHandle'
import { mapGetters } from 'vuex'

export default {
  name: 'MusicManageSystemHomeView',

  data() {
    return {
      isShowUserForm: false,
      toggleClass: 'el-icon-s-fold',
      menuList: [],
      toggleIndex: false,
      asideWidth: '300px',
      audio: this.$store.getters['musicPlayer/getMusicList']
    }
  },

  components: {
    APlayer,
    userDetail: () => import('@/components/user/userDetail.vue')
  },

  watch: {
    playList(newValue) {
      this.audio = newValue
    }
  },

  computed: {
    ...mapGetters({ playList: 'musicPlayer/getMusicList' })
  },

  mounted() {
    let originRoutes = store.getters['dynamicRoutes/getDynamicRoutes'][0].children
    this.menuList = originRoutes
      .sort((a, b) => {
        return a.meta.priority - b.meta.priority
      })
      .map(route => {
        return {
          index: `${store.getters['dynamicRoutes/getDynamicRoutes'][0].path}/${route.path}`,
          icon: route.meta.icon,
          title: route.meta.title
        }
      })
  },

  methods: {
    async clickLogoutHandler() {
      // 清除登录索引 和 用户信息
      await this.$store.dispatch('userProfile/clearUserData')
      deleteCookie('Access-Token')
      localStorage.removeItem('Access-Token')
      // 重置路由
      await resetRouter()
      await this.$store.dispatch('dynamicRoutes/asyncClearRoutes')
      // 退出登录弹窗
      this.$message({
        message: '退出登录成功',
        type: 'success',
        duration: 2000
      })
      // 跳转登录页
      await this.$router.replace('/login/login')
    },
    // 收缩导航栏按钮点击事件
    toggleClick() {
      if (this.toggleIndex) {
        this.toggleIndex = false
        this.asideWidth = '300px'
        this.toggleClass = 'el-icon-s-fold'
      } else {
        this.toggleIndex = true
        this.asideWidth = '0px'
        this.toggleClass = 'el-icon-s-unfold'
      }
    },
    // 点击 LOGO 跳转首页
    clickLogoHandler() {
      if (this.$router.currentRoute.name !== 'HomePage') {
        this.$router.replace('/home')
      }
    },
    // 隐藏 Drawer
    hideDrawer() {
      this.isShowUserForm = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}

.el-header {
  background-image: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0;

  .logo-container {
    width: 350px;
    display: flex;

    .logo {
      width: 300px;
      line-height: 60px;
      cursor: pointer;
      transition: 0.3s;
      color: #fafafa;

      h3 {
        font-size: 20px;
        font-weight: 300;
        text-align: center;
        font-family: '阿里妈妈东方大楷 Regular', sans-serif;
      }
    }

    .logo:hover {
      color: #d6fff3;
    }

    .toggle-container {
      width: 50px;
      height: 100%;

      i {
        font-size: 28px;
        display: block;
        transition: color 0.15s linear;
        text-align: center;
        line-height: 60px;
        cursor: pointer;
      }

      i:hover {
        color: #c1ff5c;
      }
    }
  }

  .user-container {
    width: 150px;
    display: flex;
    font-size: 28px;
    transition: color 0.15s linear;
    text-align: center;
    line-height: 60px;
    margin-right: 20px;

    .userInfo {
      width: 75px;
    }

    .logout {
      width: 75px;
    }

    i {
      transition: color 0.15s linear;
      cursor: pointer;
    }

    i:hover {
      color: #c1ff5c;
    }
  }
}

.body-container {
  height: auto;
}

.el-aside {
  transition: 0.5s;
  //height: calc(100vh - 60px);
  background-color: #545c64;

  .el-menu {
    border-right: 0;

    ::-webkit-scrollbar {
      display: none;
    }
  }

  .el-menu-item {
    padding-left: 30px !important;

    i {
      margin-right: 5px;
      width: 24px;
      text-align: center;
      font-size: 18px;
      vertical-align: middle;
    }
  }
}

.page-bg {
  display: block;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-size: cover !important;
  background-attachment: fixed !important;
  background: url('@/assets/image/bg.jpg'), no-repeat;
}

.el-main {
  //height: calc(100vh - 60px);
  color: #333;
  text-align: center;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.main-container {
  z-index: 2;
  height: 100%;
  display: flex;
}

.main-container::-webkit-scrollbar {
  display: none;
}

.footer {
  z-index: 2;
  height: 60px;
  line-height: 60px;
  color: white;
}

.aplayer {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 10;
}
</style>