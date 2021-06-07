<template>
  <div :id="selector" />
</template>

<script>
import E from 'wangeditor'
import xss from 'xss'

export default {
  name: 'MyEditor',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    // 富文本内容
    value: {
      type: String,
      default: '',
    },
    // 选择器，默认 editor， 当页面存在多个时请传入，否则将出现问题
    selector: {
      type: String,
      default: 'editor',
    },
    // 占位
    placeholder: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      editor: null,
      content: '',
    }
  },
  computed: {},
  watch: {
    /**
     * content更新时通知父组件更新v-model绑定的值
     * @param {String} val onChoice的新值
     */
    content(val) {
      this.$emit('change', val)
    },
    /**
     * value（v-model绑定的值）更新时更新content的值
     * @param {String} val onChoice的新值
     */
    value(val) {
      if (this.editor && val !== this.content) {
        this.editor.txt.html(val)
      }
      this.content = val
    },
  },
  created() {},
  mounted() {
    this.editor = new E(`#${this.selector}`)
    this.editor.config.placeholder = this.placeholder
    this.editor.config.zIndex = 5
    this.editor.config.focus = false
    this.editor.config.showLinkImg = false
    this.editor.config.excludeMenus = ['video']

    // 自定义Alert
    this.editor.config.customAlert = (s, t) => {
      switch (t) {
        case 'success':
          this.$message.success(s)
          break
        case 'info':
          this.$message.info(s)
          break
        case 'warning':
          this.$message.warning(s)
          break
        case 'error':
          this.$message.error(s)
          break
        default:
          this.$message.info(s)
          break
      }
    }

    // 文本输入回调
    this.editor.config.onchange = (newHtml) => {
      this.content = xss(newHtml)
    }

    // 上传图片
    this.editor.config.customUploadImg = (resultFiles, insertImgFn) => {
      for (const file of resultFiles) {
        this.$qiniu.qiniuUpload({
          file,
          path: this.path,
          error: (err) => {
            this.$message.warning(err)
          },
          complete: (res) => {
            insertImgFn(res.url)
          },
        })
      }
    }

    this.editor.create()

    this.editor.txt.html(this.value)
  },
  methods: {
    /**
     * 点击取消按钮
     */
    cancel() {
      this.show = false
      this.$emit('cancel')
    },
    /**
     * 点击确认按钮
     */
    confirm() {
      this.$emit('confirm')
    },
  },
}
</script>

<style scoped></style>
