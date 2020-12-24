export const state = () => ({
  token: null,
  userInfo: null,
  authList: [],
  // 表格导入
  importStatus: {},
})

export const mutations = {
  /**
   * 清空所有状态
   * @param {*} state state
   */
  clearAll(state) {
    state.token = null
    state.userInfo = null
    state.authList = []
    // 表格导入
    state.importStatus = {}
  },
  setToken(state, token) {
    state.token = token
  },
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo
  },
  setAuthList(state, authList) {
    state.authList = authList
  },
  /**
   * 寄存表格导入状态
   * @param {Vuex.state} state state
   * @param {Object} importStatus 表格导入状态
   */
  setImportStatus(state, importStatus) {
    state.importStatus = importStatus
  },
}
