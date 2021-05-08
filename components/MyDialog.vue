<template>
  <el-dialog
    class="dialog"
    :class="{ 'dialog--body-nopadding': bodyNoPadding }"
    :title="title"
    :visible.sync="show"
    :width="`${width}px`"
  >
    <slot></slot>
    <div v-if="showButton" slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'MyDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
      default: 180,
    },
    title: {
      type: String,
      default: '',
    },
    // 是否显示底部操作按钮
    showButton: {
      type: Boolean,
      default: true,
    },
    // BODY无内边距
    bodyNoPadding: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      show: false,
    }
  },
  computed: {},
  watch: {
    /**
     * visible 绑定的值）更新时更新imageUrl的值
     * @param {String} val onChoice的新值
     */
    visible(val) {
      this.show = val
    },
    /**
     * imageUrl更新时通知父组件更新v-model绑定的值
     * @param {String} val onChoice的新值
     */
    show(val) {
      this.$emit('update:visible', val)
    },
  },
  created() {},
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

<style scoped>
/* 弹窗 */
.dialog {
}

.dialog--bothsides-nopadding >>> .el-dialog__body {
  padding-left: 0;
  padding-right: 0;
}

.dialog--body-nopadding >>> .el-dialog__body {
  padding: 0;
}

.dialog .el-dialog__header {
  padding: 15px 20px;
  border-bottom: solid 1px #d9d9d9;
}

.dialog--header-no-border .el-dialog__header {
  border-bottom: none;
}

.dialog .el-dialog__footer {
  padding: 15px;
  border-top: solid 1px #d9d9d9;
}
</style>
