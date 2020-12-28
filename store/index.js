export const state = () => ({
  token: null,
  userInfo: null,
  menuTree: [],
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
  /**
   * 寄存Token
   * @param {Vuex.state} state state
   * @param {Object} token 用户Token
   */
  setToken(state, token) {
    state.token = token
  },
  /**
   * 寄存登录用户信息
   * @param {Vuex.state} state state
   * @param {Object} userInfo 用户信息
   */
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo
  },
  /**
   * 寄存菜单树
   * @param {Vuex.state} state state
   * @param {Object} menuTree 菜单树
   */
  setMenuTree(state, menuTree) {
    state.menuTree = menuTree
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
