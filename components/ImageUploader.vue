<template>
  <el-upload
    class="image-uploader"
    :style="{ width: innerWidth + 'px', height: innerHeight + 'px' }"
    action=""
    :disabled="onUpload"
    :show-file-list="false"
    :before-upload="beforeAvatarUpload"
    :http-request="uploadSectionFile"
    :accept="accept"
  >
    <el-image
      class="image-uploader__image"
      :src="imageShowUrl"
      :style="{
        width: `${innerWidth}px`,
        height: `${innerHeight}px`,
      }"
      fit="cover"
      @load="imageLoaded"
    >
      <template slot="error">
        <slot>
          <div class="image-uploader__placeholder">
            <i class="el-icon-plus" />
          </div>
        </slot>
      </template>
    </el-image>
    <transition name="el-fade-in">
      <div v-show="onUpload" class="image-uploader__progress">
        <el-progress
          type="circle"
          :width="progressSize"
          :percentage="progress"
          :status="uploadStatus"
        />
      </div>
    </transition>
  </el-upload>
</template>

<script>
export default {
  name: 'ImageUploader',
  model: {
    prop: 'url',
    event: 'change',
  },
  props: {
    url: {
      default: null,
      validator(value) {
        if (typeof value === 'string' || Array.isArray(value)) {
          return true
        }
      },
    },
    width: {
      type: Number,
      default: 180,
    },
    height: {
      type: Number,
      default: null,
    },
    accept: {
      type: String,
      default: 'image/*',
    },
    imgStyle: {
      type: String,
      default: '',
    },
    // 图片上传路径，非空字符串时必须以/结尾
    path: {
      type: String,
      default: '',
    },
    // 图片大小限制，默认2M
    maximumSize: {
      type: Number,
      default: 1024 * 1024 * 2,
    },
  },
  data() {
    return {
      innerWidth: 0,
      innerHeight: 0,

      // 单张图片上传
      previewImageUrl: '',
      imageUrl: '',
      onUpload: false,
      progressSize: 144,
      progress: 0,
      uploadStatus: null,
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
     * imageUrl更新时通知父组件更新v-model绑定的值
     * @param {String} val onChoice的新值
     */
    imageUrl(val) {
      this.$emit('change', val)
    },
    /**
     * url（v-model绑定的值）更新时更新imageUrl的值
     * @param {String} val onChoice的新值
     */
    url(val) {
      this.imageUrl = val
    },
  },
  created() {
    this.imageUrl = this.url

    if (this.width) {
      this.innerWidth = this.width
    }

    if (this.height) {
      this.innerHeight = this.height
    } else {
      this.innerHeight = this.innerWidth
    }

    this.progressSize = Math.min(this.innerHeight, this.innerWidth) * 0.8
  },
  methods: {
    /**
     * 预览图片(单张)
     * @param {File} file 文件
     */
    beforeAvatarUpload(file) {
      // 上传前判断图片大小是否超过限制
      if (file.size > this.maximumSize) {
        this.$message.warning(
          `图片不能超过 ${this.byteConvert(this.maximumSize)}!`
        )
        return false
      }

      this.previewImageUrl = URL.createObjectURL(file)
      this.imageUrl = ''
      this.onUpload = true
      this.progress = 0
      this.uploadStatus = null
    },
    /**
     * 上传图片（单张）
     * @param { Object} params 包含文件的数据
     */
    uploadSectionFile(params) {
      const file = params.file

      this.$qiniu.qiniuUpload({
        file,
        path: this.path,
        next: (res) => {
          this.progress = res.total.percent * 0.9
        },
        error: (err) => {
          this.$emit('error', err)
          this.uploadStatus = 'warning'
        },
        complete: (res) => {
          this.imageUrl = res.url
          this.$emit('success', this.imageUrl)
        },
      })

      // this.$http.api({
      //   url: '/merchant/file/upload',
      //   params,
      //   loading: true,
      //   method: 'post',
      //   type: 'form',
      //   success: (data) => {
      //     this.progress = 90
      //     this.imageUrl = data.data.url
      //     this.$emit('success', this.imageUrl)
      //   },
      //   fail: (err) => {
      //     this.$emit('error', err)
      //     this.uploadStatus = 'warning'
      //   },
      // })
    },
    /**
     * 图片加载完成(单张)
     */
    imageLoaded() {
      if (this.imageUrl) {
        this.progress = 100
        this.uploadStatus = 'success'
        setTimeout(() => {
          this.onUpload = false
        }, 1000)
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
