import Vue from 'vue'
import { Message, Loading } from 'element-ui'
import qs from 'qs'

export default function ({ $axios, store, app }) {
  $axios.setBaseURL(process.env.apiBaseURL)

  Vue.prototype.$http = {
    api({
      url,
      method = 'get',
      params = {},
      success,
      fail,
      complete,
      loading = false,
      type = 'json',
      headers = {},
    }) {
      // 动态设置token
      $axios.setToken(store.state.token)

      let loadingService = null
      if (loading !== false) {
        if (loading === true) {
          loadingService = Loading.service()
        } else {
          loadingService = Loading.service({ text: loading })
        }
      }

      if (type === 'form') {
        params = qs.stringify(params)
      }

      $axios({
        method,
        url,
        data: method === 'post' ? params : null,
        params: method === 'get' ? params : null,
        headers,
      })
        .then((res) => {
          // 请求成功
          if (res.data.code === 1) {
            if (success) {
              success(res.data)
            }
          } else {
            if (res.data.code === 401) {
              app.router.replace('/login')
            }
            Message.warning(res.data.msg)

            // 回调
            if (fail) {
              fail(res)
            }
          }
        })
        .catch((error) => {
          // 请求失败
          if (error.response) {
            if (error.response.code === 401) {
              // token过期或未登录
              Message.warning('请登陆')
            } else if (error.response.code === 403) {
              Message.warning('该用户无此权限')
            } else {
              Message.warning(error.toString())
            }
          } else {
            console.error(error) // 请勿删除方便发现问题
            if (error.toString().includes('Network Error')) {
              Message.closeAll()
              Message('网络错误')
            } else {
              Message.error('未知服务器错误')
            }
          }
          if (fail) {
            fail(error)
          }
        })
        .finally(() => {
          // 完成（不管成功或失败）
          if (loading !== false) {
            loadingService.close()
          }

          if (complete) {
            complete()
          }
        })
    },
    /**
     * 下载文件（主要用于导出excel）
     * @param {String} url 下载地址
     * @param {Object} params 下载请求参数
     * @param {String} fileName 文件名
     * @param {Boolean} loading 是否需要显示全屏loading
     */
    downLoad({ url, params = {}, fileName = 'file', loading = true }) {
      const route = app.router.resolve({
        path: url,
        query: params,
      })
      const token = store.state.token

      let loadingService = null
      if (loading !== false) {
        if (loading === true) {
          loadingService = Loading.service()
        } else {
          loadingService = Loading.service({ text: loading })
        }
      }
      const xhr = new XMLHttpRequest()
      xhr.open('GET', `${process.env.apiBaseURL}${route.href}`)
      xhr.setRequestHeader('Authorization', 'Bearer ' + token)
      xhr.send()
      xhr.responseType = 'blob' // 设置请求回来的数据为blob方式
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const blob = new Blob([this.response], {
            type: 'application/vnd.ms-excel',
          })
          const fileUrl = URL.createObjectURL(blob)
          const downLoadLink = document.createElement('a')
          downLoadLink.download = fileName
          downLoadLink.href = fileUrl
          document.body.appendChild(downLoadLink)
          downLoadLink.click()
          document.body.removeChild(downLoadLink)
        }

        if (loading !== false) {
          loadingService.close()
        }
      }
    },
  }
}
