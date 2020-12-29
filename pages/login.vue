<template>
  <div class="container">
    <div class="header">
      <img src="/img/logo.png" />
    </div>
    <div class="login-box">
      <el-card class="login" shadow="never">
        <div class="login__header">
          <img src="/img/logo.png" />
        </div>
        <el-form ref="form" :model="form">
          <el-form-item>
            <el-input
              v-model="form.username"
              placeholder="用户名"
              @keypress.enter.native="doLogin"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              @keypress.enter.native="doLogin"
            />
          </el-form-item>
          <el-button class="loginbtn" type="primary" @click="doLogin">
            登 录
          </el-button>
        </el-form>
      </el-card>
    </div>
    <div class="bottom">
      <div>
        ©2020 kehaitong.cn. All rights reserved 青岛启力互联信息技术有限公司
      </div>
      <div>电信与信息服务业务经营许可证：鲁ICP备15021006号-4</div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
    }
  },
  methods: {
    /**
     * 进行登录
     */
    doLogin() {
      const params = {
        account: this.form.username,
        password: this.form.password,
      }
      this.$http.api({
        url: 'admin/login',
        params,
        method: 'post',
        type: 'form',
        success: (res) => {
          this.$store.commit('setToken', res.data.token)
          this.$store.commit('setUserInfo', res.data.info)
          this.$store.commit('setMenuTree', res.data.menu)
          this.$store.commit('setAuthList', res.data.auth)
          this.$cookies.set('token', res.data.token)
          this.$router.replace('/')
        },
      })
    },
  },
}
</script>

<style scoped>
.container {
  width: 100wh;
  height: 100vh;
  display: flex;
  align-items: stretch;
  flex-direction: column;
}

.header {
  height: 90px;
}

.header img {
  height: 79px;
  margin-top: 6px;
  margin-left: 58px;
}

.login-box {
  flex: 1;
  background-image: url('/img/login/bg.png');
  background-size: auto 100%;
  background-repeat: no-repeat;
  background-color: rgb(31, 146, 248);
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
}

.login {
  width: 300px;
  margin-bottom: 100px;
  margin-right: 157px;
  border: none;
}

.login__header {
  text-align: center;
  margin-bottom: 20px;
}

.login__header img {
  height: 50px;
}

.loginbtn {
  width: 100%;
}

.bottom {
  height: 140px;
  font-size: 14px;
  color: rgba(142, 152, 166, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.bottom div {
  line-height: 25px;
}
</style>
