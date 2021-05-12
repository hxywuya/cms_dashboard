import Vue from 'vue'
import * as qiniu from 'qiniu-js'

export default function () {
  Vue.prototype.$qiniu = {
    /**
     * 七牛云上传
     * @param file
     * @param path
     * @param callback
     * @returns {Promise<void>}
     */
    async qiniuUpload({ file, path, next, error, complete }) {
      const token = await this.qiniuToken(path)
      const observable = qiniu.upload(file, null, token)
      observable.subscribe({
        next(res) {
          if (next) {
            next(res)
          }
        },
        error(err) {
          if (error) {
            error(err)
          }
        },
        complete(res) {
          if (complete) {
            res.url = `${process.env.fileStore}/${res.key}`
            complete(res)
          }
        },
      })
    },
    /**
     * 获取七牛云token
     * @param path
     * @returns {Q.Promise<any>}
     */
    qiniuToken(path = '') {
      return new Promise((resolve, reject) => {
        Vue.prototype.$http.api({
          url: '/upload/getToken',
          params: { path },
          method: 'post',
          success: (res) => {
            resolve(res.data)
          },
          fail: (res) => {
            resolve(false)
          },
        })
      })
    },
  }
}
