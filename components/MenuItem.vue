<template>
  <el-menu-item v-if="menu.children.length <= 0" :index="menu.rule">
    <i v-if="menu.icon" :class="`el-icon-${menu.icon}`" />
    <span slot="title">{{ menu.name }}</span>
  </el-menu-item>
  <el-submenu v-else :index="menu.rule">
    <template slot="title">
      <i v-if="menu.icon" :class="`el-icon-${menu.icon}`" />
      <span>{{ menu.name }}</span>
    </template>
    <menu-item
      v-for="children in menu.children"
      :key="children.id"
      :menu="children"
    />
  </el-submenu>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    // 数据
    menu: {
      type: Object,
      default: () => {
        return null
      },
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
</style>
