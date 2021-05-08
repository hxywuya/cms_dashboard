<template>
  <div class="page-top" :class="{ 'page-top--nomargin': noMargin }">
    <div class="page-top__left">
      <slot></slot>
      <!-- <div class="page-top__label">{{ label }}</div> -->
    </div>
    <div v-if="back" class="page-top__back" @click="$router.go(-1)">
      <el-button icon="el-icon-arrow-left" size="mini" /> <span>返回</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageTop',
  props: {
    // 数据
    label: {
      type: String,
      default: '',
    },
    noMargin: {
      type: Boolean,
      default: false,
    },
    back: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped>
.page-top {
  background-color: rgba(255, 255, 255, 1);
  border-bottom: solid 1px #e6e6e6;
  padding: 15px 30px;
  margin-bottom: 18px;
  display: flex;
}

.page-top--nomargin {
  margin-bottom: 0;
}

.page-top__left {
  flex: 1;
}

.page-top__label {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
}

.page-top__back {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.page-top__back .el-button {
  padding: 7px 7px;
  margin-right: 7px;
}

.page-top__back > span {
  font-size: 14px;
  color: rgba(51, 51, 51, 1);
  line-height: 20px;
  transition: 0.1s;
}

.page-top__back:hover .el-button,
.page-top__back:focus .el-button {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.page-top__back:hover > span,
.page-top__back:focus > span {
  color: #409eff;
}

.page-top >>> .isactive {
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  color: #303133;
}
</style>
