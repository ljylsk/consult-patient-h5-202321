<script setup lang="ts">
// 引入 Vant 4 组件库中的组件【引入的组件名为了和html标签进行区分，使用 as 重命名】
// import { Button as vanButton } from 'vant'
// 但是，安装插件unplugin-vue-components【pnpm add unplugin-vue-components -D】并在vite.config.ts文件中配置后会自动按需导入vant组件，只需要在项目中使用vant组件即可，无需import引入了。
// Vant 4 => 开发指南 => 快速上手 => 引入组件 => 方法二.按需引入组件样式 => 1.安装插件unplugin-vue-components => 2.在vite.config.ts文件配置插件
</script>

<template>
  <!-- 使用 Vant 4 组件Button -->
  <!-- 组件的属性【如type】的属性值的可选结果通过快捷键Ctrl+i展示 -->
  <!-- <van-button type="primary">vant按钮</van-button> -->

  <!-- 一级路由出口 -->
  <router-view></router-view>
</template>

<style scoped lang="scss"></style>
