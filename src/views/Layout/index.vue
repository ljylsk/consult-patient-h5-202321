<script setup lang="ts"></script>

<template>
  <div class="layout-page">
    <!-- 二级路由出口 Home Article User Notify 等组件 -->
    <router-view></router-view>

    <!-- 底部导航 -->
    <!-- Vant 4 组件 Tabbar 标签栏 -->
    <!-- route属性 是否开启路由模式 -->
    <van-tabbar route>
      <!-- to属性	点击后跳转的目标路由对象，等同于 vue-router 的 to 属性 -->
      <van-tabbar-item to="/home">
        首页
        <!-- 通过具名插槽(icon)自定义图标。active为插槽作用域中的一个数据 布尔型。当点击文字时，active为true。{ active } 也可以写成随便一个变量名，如props，后续使用active时，通过props.active获取  -->
        <template #icon="{ active }">
          <!-- CpIcon为封装的svg组件 -->
          <!-- 点击首页时，此作用域插槽的active为true，svg图标为icons/home/文件夹下的index-active图标；点击首页以外的其他导航文字时，此处作用域插槽的active为false，svg图标为icons/home/文件夹下的index-default图标 -->
          <cp-icon :name="`home-index-${active ? 'active' : 'default'}`"></cp-icon>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/article">
        健康百科
        <template #icon="{ active }">
          <cp-icon :name="`home-article-${active ? 'active' : 'default'}`"></cp-icon>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/notify">
        消息通知
        <template #icon="{ active }">
          <cp-icon :name="`home-notice-${active ? 'active' : 'default'}`"></cp-icon>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/user">
        个人中心
        <template #icon="{ active }">
          <cp-icon :name="`home-mine-${active ? 'active' : 'default'}`"></cp-icon>
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style lang="scss" scoped>
.layout-page {
  :deep() {
    .van-tabbar-item {
      &__icon {
        font-size: 21px;
      }
      &__text {
        font-size: 11px;
      }
      &:not(.van-tabbar-item--active) {
        color: var(--cp-text3);
      }
    }
  }
}
</style>
