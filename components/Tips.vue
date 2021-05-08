<template>
  <div class="tips">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Tips',
  props: {},
}
</script>

<style scoped>
.tips {
  display: inline-block;
  font-size: 14px;
  color: rgba(250, 101, 25, 1);
  line-height: 32px;
}
</style>
