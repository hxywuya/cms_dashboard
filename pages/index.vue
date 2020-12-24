<template>
  <div class="container">
    <pagetop label="首页">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>CRM</el-breadcrumb-item>
        <el-breadcrumb-item>
          <span class="isactive">首页</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </pagetop>
    <div v-loading="onLoading">
      123123123123123123123123123123123123123123123
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      onLoading: false,
      data: {},
      customerData: {},

      needConfigure: false, // 是否已经填写企业微信配置信息
    }
  },
  created() {
    // this.getData()
    // this.getCustomerData()
    // this.checkConfigure()
  },
  methods: {
    getData() {
      this.$http.api({
        url: '/chatanalysis/main',
        params: {},
        method: 'get',
        type: 'form',
        success: (res) => {
          this.data = {
            chatTotals: res.data.chatTotal,
            msgSendTotals: res.data.sendTotal,
            rspRate: res.data.replyPercentage,
            averageRspT: res.data.avgReplyTime,
          }
          this.onLoading = false
        },
      })
    },
    getCustomerData() {
      const params = {}
      this.$http.api({
        url: '/dataAnalysisChart/getHomeCounts',
        params,
        method: 'get',
        type: 'form',
        success: (res) => {
          this.customerData = {
            userCount: res.data.userCounts,
            weChatCount: res.data.externalUserCounts,
            employeeCount: res.data.employeeCounts,
            newUsersToday: res.data.newUsersToday,
            deleteUserCount: res.data.deleteUserCounts,
          }
          this.onLoading = false
        },
      })
    },
    /**
     * 检查配置信息
     */
    checkConfigure() {
      this.$http.api({
        url: '/authCorporate/getAuthCorporate',
        success: (res) => {
          if (
            !res.data.conversationSecret ||
            !res.data.contactSecret ||
            !res.data.contactToken ||
            !res.data.contactEncodingAESKey ||
            !res.data.appAgentId ||
            !res.data.appSecret
          ) {
            this.needConfigure = true
          }
        },
      })
    },
  },
}
</script>

<style scoped>
.container {
}
.contentfl {
  width: calc(100% - 220px);
}
.contenth {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.contentfr {
  width: 200px;
  background: #fff;
  min-height: 210px;
}
.numberlist {
  overflow: hidden;
  margin: 0;
}
.numberlist li {
  float: left;
  width: calc((100% - 50px) / 5);
  margin-right: 10px;
  background: #fff;
  text-align: center;
  padding: 30px 0;
  border-radius: 4px;
  border: 1px solid #eee;
  margin-bottom: 10px;
}
.demo {
  padding: 20px 20px;
}

.need-configure {
  margin-top: 4px;
  font-size: 16px;
  color: red;
}
</style>
