import Vue from 'vue'
import { Loading } from 'element-ui'
import dayjs from 'dayjs'

export default function () {
  Vue.prototype.$util = {
    dayjs,
    /**
     * 深拷贝
     * @param {*} obj 需要深拷贝的数据
     * @returns {String}
     */
    deepCopy(obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    /**
     * 格式化时间
     * @param {String} format 格式 默认 yyyy-MM-dd hh:mm:ss.S ==> 2006-07-02 08:09:04.423
     * @param {Number} timestamp 时间戳（秒）不传为当前时间
     * @param {String} type 时间戳类型 s:秒级 m:毫秒级
     * @returns {String}
     */
    getDate(format = 'yyyy-MM-dd hh:mm:ss.S', timestamp, type = 's') {
      // 对Date的扩展，将 Date 转化为指定格式的String
      // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
      // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
      // 例子：
      // getDate("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
      // getDate("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18

      let date = null
      if (timestamp) {
        if (type === 's') {
          date = new Date(timestamp * 1000)
        } else {
          date = new Date(timestamp)
        }
      } else {
        date = new Date()
      }

      const types = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        S: date.getMilliseconds(), // 毫秒
      }

      if (/(y+)/.test(format)) {
        format = format.replace(
          RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length)
        )
      }

      for (const k in types) {
        if (new RegExp('(' + k + ')').test(format)) {
          format = format.replace(
            RegExp.$1,
            RegExp.$1.length === 1
              ? types[k]
              : ('00' + types[k]).substr(('' + types[k]).length)
          )
        }
      }

      return format
    },
    /**
     * 解析组织架构数据，当children为空或空数组的，将children置为null
     * @param {Array[Object]} departmentTree 组织架构数据
     * @returns {Array[Object]}
     */
    analyticDepartmentTree(departmentTree) {
      for (const department of departmentTree) {
        if (!department.children || department.children.length <= 0) {
          department.children = null
        } else {
          department.children = this.analyticDepartmentTree(department.children)
        }
      }

      return departmentTree
    },
    /**
     * 获取文件大小
     * @param {Number} fileByte 文件Byte数值
     */
    getFileSize(fileByte) {
      const fileSizeByte = fileByte
      let fileSizeMsg = ''
      if (fileSizeByte < 1024) {
        fileSizeMsg = fileSizeByte + 'B'
      } else if (fileSizeByte < 1048576) {
        fileSizeMsg = window.parseFloat((fileSizeByte / 1024).toFixed(2)) + 'KB'
      } else if (fileSizeByte === 1048576) {
        fileSizeMsg = '1MB'
      } else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) {
        fileSizeMsg =
          window.parseFloat((fileSizeByte / (1024 * 1024)).toFixed(2)) + 'MB'
      } else if (fileSizeByte > 1048576 && fileSizeByte === 1073741824) {
        fileSizeMsg = '1GB'
      } else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) {
        fileSizeMsg =
          window.parseFloat((fileSizeByte / (1024 * 1024 * 1024)).toFixed(2)) +
          'GB'
      } else {
        fileSizeMsg = '文件超过1TB'
      }
      return fileSizeMsg
    },
    /**
     * 下载文件
     * @param {Number} fileByte 文件Byte数值
     */
    fileDownLoad(fileUrl, fileName) {
      if (fileName) {
        const loading = Loading.service()
        const xhr = new XMLHttpRequest()
        xhr.open('get', fileUrl, true)
        xhr.responseType = 'blob'
        xhr.onload = function () {
          if (this.status === 200) {
            fileUrl = window.URL.createObjectURL(this.response)
            const downLoadLink = document.createElement('a')
            downLoadLink.download = fileName
            downLoadLink.href = fileUrl
            document.body.appendChild(downLoadLink)
            downLoadLink.click()
            document.body.removeChild(downLoadLink)
          }
          loading.close()
        }
        xhr.send()
      } else {
        const downLoadLink = document.createElement('a')
        downLoadLink.href = fileUrl
        document.body.appendChild(downLoadLink)
        downLoadLink.click()
        document.body.removeChild(downLoadLink)
      }
    },
    /**
     * Base64转Blob
     * @param {base64Data} base64Data Base64数据
     */
    base64ToBlob(base64Data) {
      const arr = base64Data.split(',')
      const fileType = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let l = bstr.length
      const u8Arr = new Uint8Array(l)

      while (l--) {
        u8Arr[l] = bstr.charCodeAt(l)
      }
      return new Blob([u8Arr], {
        type: fileType,
      })
    },
    /**
     * Blob转File
     * @param {Blob} blob Blob数据
     * @param {String} fileName 文件名
     */
    blobToFile(blob, fileName = 'file') {
      blob.lastModifiedDate = new Date()
      blob.name = fileName
      return blob
    },
  }
}
