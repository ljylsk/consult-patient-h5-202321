<script setup lang="ts">
// 需求：
// 1. 点击左箭头，返回上一个页面(历史记录)
// 2. 暴露一个props属性 title 设置标题
// 3. 暴露一个props属性 rightText 设置右侧文字

import { useRouter } from 'vue-router'

// 4. 点击右侧文字按钮，要做的事情是无法确定的。通过事件来通知父组件
defineProps<{
  title?: string // ?表示可选
  rightText: string
}>()

const router = useRouter() // 返回 router 实例。相当于在模板中使用 $router。必须在 setup() 中调用获取
const onClickLeft = () => {
  // 返回
  if (history.state?.back) {
    // Vue Router 将信息保存在 history.state 上
    // 如果历史记录中有回退
    router.back() // 返回上一级
  } else {
    // 历史记录没有回退
    router.push('/') // 返回首页
  }
}

const emit = defineEmits<{
  (e: 'click-right'): void
}>()
const onClickRight = () => {
  // 点击右侧文字按钮，执行的逻辑
  emit('click-right')
}
</script>

<template>
  <!-- vant组件 NavBar 导航栏 -->
  <van-nav-bar
    fixed
    left-arrow
    @click="onClickLeft"
    :title="title"
    :right-text="rightText"
    @click-right="onClickRight"
  ></van-nav-bar>
</template>

<style lang="scss" scoped>
// 样式穿透
::v-deep() {
  /*
  .van-nav-bar__arrow {
    font-size: 18px;
    color: var(--cp-text1);
  }
  .van-nav-bar__text {
    font-size: 15px;
  } 
  */
  // 提取类名的相同部分：
  .van-nav-bar {
    &__arrow {
      font-size: 18px;
      color: var(--cp-text1);
    }
    &__text {
      font-size: 15px;
    }
  }
}
</style>
