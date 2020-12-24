import Vue from 'vue'

export default function ({ store }) {
  Vue.prototype.$auth = {
    check(auth) {
      if (store.state.authList.includes(auth)) {
        return true
      }
      return false
    },
  }
}
