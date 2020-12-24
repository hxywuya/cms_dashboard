<template>
  <el-container class="default-layout-container">
    <div v-if="!userInfo" class="notshow"></div>
    <el-header class="header">
      <div class="logo">
        <img src="/img/logo.png" />
      </div>
      <div v-if="userInfo" class="user">
        {{ userInfo.name ? userInfo.name : userInfo.account }}，欢迎使用！
        <el-button type="text" @click="logout">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside class="aside" width="201px">
        <el-scrollbar class="menu-scrollbar" wrap-class="menu-scrollbar-wrap">
          <el-menu
            :default-active="defaultActiveMenu"
            class="menu"
            router
            background-color="#23232f"
            text-color="#777a89"
            active-text-color="#ffd04b"
            @select="menuSelect"
          >
            <menuItem v-for="menu in menuTree" :key="menu.id" :menu="menu" />
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <el-main class="main">
        <el-scrollbar
          class="main-scrollbar"
          view-class="main-scrollbar-view"
          wrap-class="main-scrollbar-wrap"
        >
          <Nuxt v-if="userInfo && !refresh" />
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'
import Vue from 'vue'
import MenuItem from '~/components/MenuItem'

Vue.use(MenuItem)

export default {
  data() {
    return {
      defaultActiveMenu: '/',
      menuTree: [],
      refresh: false,
    }
  },
  computed: {
    // 将store.state中的属性映射到computed
    ...mapState(['userInfo']),
  },
  created() {
    this.defaultActiveMenu = this.$route.fullPath
    localStorage.setItem('entryTime', this.$util.dayjs().unix())
  },
  mounted() {
    this.init()
  },
  methods: {
    /**
     * 设定token如果存在的话
     */
    init() {
      const token = this.$cookies.get('token')
      if (token) {
        this.$store.commit('setToken', token)
        if (!this.userInfo) {
          this.getUser()
        }
      } else {
        this.$router.replace('/login')
      }
    },
    /**
     * 获取登录用户信息
     */
    getUser() {
      this.$http.api({
        url: 'admin/info',
        loading: true,
        success: (res) => {
          this.$store.commit('setUserInfo', res.data.info)
          // this.$store.commit('setAuthList', res.data.roleInfo.menuUrlsPriv)
          this.menuTree = res.data.menu
        },
      })
    },
    /**
     * 退出登录
     */
    logout() {
      this.$cookies.removeAll()
      this.$store.commit('clearAll')
      this.$router.push('/login')
    },
    /**
     * 菜单点击回调，如果路由一样则刷新面板
     * @param {String} menu 需要跳转的地址
     */
    menuSelect(menu) {
      if (this.$route.path === menu) {
        this.refresh = true
        setTimeout(() => {
          this.refresh = false
        }, 10)
      }
    },
  },
}
</script>

<style scoped>
.default-layout-container {
  height: 100vh;
}

.notshow {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 1);
  z-index: 2;
}

.header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  z-index: 1;
  padding: 0;
  display: flex;
  align-items: center;
}

.logo {
  width: 200px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo img {
  height: 50px;
}

.user {
  flex: 1;
  text-align: right;
  padding-right: 30px;
}

.menu-controller {
  font-size: 20px;
  cursor: pointer;
  transition: all 0.1s;
}

.menu-controller:hover {
  color: rgb(64, 158, 255);
}

.aside {
  max-width: 201px;
  border-right: solid 1px #e6e6e6;
  transition: all 0.2s;
}

.menu {
  border-right: none;
}

.main {
  padding: 0;
  background-color: rgba(240, 242, 245, 1);
}

.menu-scrollbar {
  background-color: rgba(35, 35, 47, 1);
}

.menu-scrollbar,
.main-scrollbar {
  width: 100%;
  height: calc(100vh - 60px);
}

.menu-scrollbar >>> .menu-scrollbar-wrap,
.main-scrollbar >>> .main-scrollbar-wrap {
  overflow-x: hidden;
}

.main-scrollbar >>> .main-scrollbar-view {
  padding-bottom: 20px;
}
</style>
