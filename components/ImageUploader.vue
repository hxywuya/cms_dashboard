<template>
  <!-- 多图上传 -->
  <div v-if="multiple" class="image-uploader-list">
    <div
      v-for="(image, i) in imageList"
      :key="image.uid"
      class="image-uploader-list__item"
    >
      <el-button
        class="image-uploader__del"
        type="text"
        icon="el-icon-delete"
        @click="imageList.splice(i, 1)"
      />
      <el-image
        class="image-uploader__image"
        :src="image.url || image.previeUrl"
        :style="{
          width: `${innerWidth}px`,
          height: `${innerHeight}px`,
        }"
        fit="cover"
        @load="imageLoaded(image)"
      />
      <transition name="el-fade-in">
        <div v-show="image.onUpload" class="image-uploader__progress">
          <el-progress
            type="circle"
            :width="progressSize"
            :percentage="image.progress"
            :status="image.status"
          />
        </div>
      </transition>
    </div>
    <el-upload
      v-if="limit > imageList.length"
      class="image-uploader"
      :style="{ width: innerWidth + 'px', height: innerHeight + 'px' }"
      action=""
      :disabled="onUpload"
      :show-file-list="false"
      :before-upload="multipleBeforeImageUpload"
      :http-request="uploadSectionFile"
      :accept="accept"
      multiple
      :limit="limit"
      :file-list="imageList"
      :on-exceed="() => $message.warning(exceedMsg || `图片不得超过${limit}个`)"
    >
      <el-image
        class="image-uploader__image"
        :src="null"
        :style="{
          width: `${innerWidth}px`,
          height: `${innerHeight}px`,
        }"
      >
        <template slot="error">
          <slot>
            <div class="image-uploader__placeholder">
              <i class="el-icon-plus" />
            </div>
          </slot>
        </template>
      </el-image>
    </el-upload>
  </div>
  <!-- 单图上传 -->
  <el-upload
    v-else
    class="image-uploader"
    :style="{ width: innerWidth + 'px', height: innerHeight + 'px' }"
    action=""
    :disabled="onUpload"
    :show-file-list="false"
    :before-upload="beforeImageUpload"
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
      @load="imageLoaded()"
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

        return false
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
    // 是否允许多图，默认单图
    multiple: {
      type: Boolean,
      default: false,
    },
    // 图片数量，允许多图时有效，不得小于2
    limit: {
      type: Number,
      default: 9,
      validator(value) {
        if (value > 2) {
          return true
        }

        return false
      },
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

      // 多图上传
      imageList: [],
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
      if (this.multiple) {
        if (val && val.length > 0) {
          const imageList = []
          for (const image of val) {
            imageList.push({
              uid: image.uid,
              name: image.name,
              progress: 100,
              status: null,
              onUpload: false,
              previeUrl: null,
              url: image.url,
            })
          }
          this.imageList = imageList
        }
      } else {
        this.imageUrl = val
        // v-model的值由父组件更新时清空本地预览图
        this.previewImageUrl = ''
      }
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
    beforeImageUpload(file) {
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
     * 预览图片(多张)
     * @param {File} file 文件
     */
    multipleBeforeImageUpload(file) {
      // 上传前判断文件大小是否超过限制
      if (file.size > this.maximumSize) {
        this.$message.warning(
          `图片不能超过 ${this.byteConvert(this.maximumSize)}!`
        )
        return false
      }

      this.imageList.push({
        uid: file.uid,
        name: file.name,
        progress: 0,
        status: null,
        onUpload: true,
        previeUrl: URL.createObjectURL(file),
        url: null,
      })
    },
    /**
     * 上传图片
     * @param { Object} params 包含文件的数据
     */
    uploadSectionFile(params) {
      const file = params.file
      let image = null
      if (this.multiple) {
        for (const img of this.imageList) {
          if (img.uid === file.uid) {
            image = img
          }
        }
      }

      this.$qiniu.qiniuUpload({
        file,
        path: this.path,
        next: (res) => {
          if (image) {
            image.progress = parseFloat((res.total.percent * 0.9).toFixed(2))
          } else {
            this.progress = parseFloat((res.total.percent * 0.9).toFixed(2))
          }
        },
        error: (err) => {
          this.$emit('error', err)
          if (image) {
            image.status = 'warning'
          } else {
            this.uploadStatus = 'warning'
          }
        },
        complete: (res) => {
          if (image) {
            image.url = res.url
          } else {
            this.imageUrl = res.url
            this.$emit('success', this.imageUrl)
          }
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
     * 图片加载完成
     */
    imageLoaded(image = null) {
      if (image) {
        image.progress = 100
        image.status = 'success'
        setTimeout(() => {
          image.onUpload = false
          this.$emit('change', this.imageList)
        }, 1000)
      } else if (this.imageUrl) {
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

/* 多图上传 */
.image-uploader-list {
  margin-right: -10px;
}

.image-uploader-list__item {
  display: inline-block;
  margin-right: 10px;
  position: relative;
}

.image-uploader__del {
  position: absolute;
  top: 0;
  right: 0;
  color: aliceblue;
  font-size: 16px;
  padding: 6px;
  z-index: 10;
  transition: 0.2s;
}

.image-uploader__del:hover {
  color: beige;
}

.image-uploader-list .image-uploader {
  margin-right: 10px;
}
</style>
