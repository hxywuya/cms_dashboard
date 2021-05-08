<template>
  <el-upload
    action=""
    :on-remove="onRemove"
    :before-upload="beforeFileUpload"
    :http-request="uploadSectionFile"
    :multiple="limit !== 1"
    :accept="accept"
    :limit="limit"
    :on-exceed="() => $message.warning(exceedMsg || `文件不得超过${limit}个`)"
    :file-list="fileList"
    style="max-width: 400px"
  >
    <el-button size="small">点击上传</el-button>
    {{ !tips && limit > 0 ? `只能上传${limit}个文件，` : ''
    }}{{ tips || `每个附件不得超过 ${fileSize}` }}
  </el-upload>
</template>

<script>
export default {
  name: 'FileUploader',
  model: {
    prop: 'files',
    event: 'change',
  },
  props: {
    files: {
      type: Array,
      default: null,
    },
    // 接受上传的文件类型
    accept: {
      type: String,
      default: '*',
    },
    // 上传上限
    limit: {
      type: Number,
      default: 0,
    },
    // 文件上传路径，非空字符串时必须以/结尾
    path: {
      type: String,
      default: '',
    },
    // 文件大小限制，默认10M
    maximumSize: {
      type: Number,
      default: 1024 * 1024 * 10,
    },
    // 文件超出数量限制的提示文本
    exceedMsg: {
      type: String,
      default: null,
    },
    // 文件超出数量限制的提示文本
    tips: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      fileSize: null,
      fileList: [],
    }
  },
  computed: {
    imageShowUrl() {
      if (!this.imageUrl && !this.previewImageUrl) {
        return null
      }
      return `${this.imageUrl || this.previewImageUrl}${this.imgStyle}`
    },
  },
  watch: {
    /**
     * fileList更新时通知父组件更新v-model绑定的值
     * @param {Array} val 文件列表
     */
    fileList(val) {
      this.$emit('change', val)
    },
    /**
     * files（v-model绑定的值）更新时更新fileList的值
     * @param {Array} val 文件列表
     */
    files(val) {
      this.fileList = val
    },
    /**
     * 文件大小限制更新
     * @param {Number} val 文件大小上限
     */
    maximumSize(val) {
      this.fileSize = this.byteConvert(val)
    },
  },
  created() {
    this.imageUrl = this.files
    this.fileSize = this.byteConvert(this.maximumSize)
  },
  methods: {
    /**
     * 上传前回调
     * @param {File} file 文件
     */
    beforeFileUpload(file) {
      // 上传前判断文件大小是否超过限制
      if (file.size > this.maximumSize) {
        this.$message.warning(`文件不能超过 ${this.fileSize}!`)
        return false
      }

      this.fileList.push({
        uid: file.uid,
        name: file.name,
        type: file.type,
        percentage: 0,
        status: 'uploading',
      })
    },
    /**
     * 上传文件
     * @param { Object} params 包含文件的数据
     */
    uploadSectionFile(params) {
      const file = params.file
      let onUpFile = null

      for (const item of this.fileList) {
        if (item.uid === file.uid) {
          onUpFile = item
          break
        }
      }

      this.$http.api({
        url: '/merchant/file/upload',
        params,
        loading: true,
        method: 'post',
        type: 'form',
        success: (data) => {
          onUpFile.percentage = 100
          onUpFile.status = 'warning'
          onUpFile.url = data.data.url
          this.$emit('success', onUpFile, data)
        },
        fail: (err) => {
          this.$emit('error', err)
          this.uploadStatus = 'warning'
        },
      })

      // this.$qiniu.qiniuUpload({
      //   file,
      //   path: this.path,
      //   next: (res) => {
      //     onUpFile.percentage = res.total.percent
      //   },
      //   error: (err) => {
      //     this.$emit('error', err)
      //     this.status = 'warning'
      //   },
      //   complete: (res) => {
      //     onUpFile.percentage = 100
      //     onUpFile.status = 'warning'
      //     onUpFile.url = res.url
      //     this.$emit('success', onUpFile, res)
      //   },
      // })
    },
    /**
     * 文件删除回调
     * @param {Object} file 文件
     */
    onRemove(file) {
      for (const key in this.fileList) {
        if (this.fileList[key].uid === file.uid) {
          this.fileList.splice(key, 1)
          return
        }
      }
    },
    /**
     * 字节换算
     */
    byteConvert(bytes) {
      if (isNaN(bytes)) {
        return ''
      }
      const symbols = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      let exp = Math.floor(Math.log(bytes) / Math.log(2))
      if (exp < 1) {
        exp = 0
      }
      const i = Math.floor(exp / 10)
      bytes = bytes / Math.pow(2, 10 * i)

      if (bytes.toString().length > bytes.toFixed(2).toString().length) {
        bytes = bytes.toFixed(2)
      }
      return bytes + symbols[i]
    },
  },
}
</script>

<style scoped>
.image-uploader {
  display: inline-block;
  position: relative;
}

.image-uploader >>> .el-upload:hover {
  opacity: 0.8;
}

.image-uploader >>> .el-upload:active {
  opacity: 1;
}

.image-uploader__image >>> .image-uploader__placeholder {
  width: 100%;
  height: 100%;
  font-size: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(245, 247, 250, 1);
  color: rgba(190, 190, 190, 1);
}

.image-uploader__progress {
  background-color: rgba(255, 255, 255, 0.6);
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
