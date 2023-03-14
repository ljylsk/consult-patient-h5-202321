<!-- 导航栏 组件 -->

<script setup lang="ts">
// 需求：
// 1. 点击左箭头，返回上一个页面(历史记录)
// 2. 暴露一个props属性 title 设置标题
// 3. 暴露一个props属性 rightText 设置右侧文字
// 4. 点击右侧文字按钮，要做的事情是无法确定的。通过事件来通知父组件
// 5. 指定左侧<是返回上一级还是要实现其他效果

import { useRouter } from 'vue-router'

// 定义属性接收父组件传过来的值
const props = defineProps<{
  // 导航栏的标题
  title?: string // ?表示可选
  // 导航栏的右侧文字
  rightText?: string
  // 导航栏左侧<要实现的效果，接收的是个函数
  back?: () => void
}>()

const router = useRouter() // 返回 router 实例。相当于在模板中使用 $router。必须在 setup() 中调用获取
const onClickLeft = () => {
  // 返回
  // 如果父组件有传back函数(定义<箭头要实现的效果)过来，直接return函数，下面的逻辑不再执行。
  if (props.back) return props.back()

  // 如果父组件没有传back函数，执行下面的逻辑
  if (history.state?.back) {
    // Vue Router 将信息保存在 history.state 上
    // 如果历史记录中有回退
    router.back() // 返回上一级
  } else {
    // 历史记录没有回退
    router.push('/') // 返回首页
  }
}

// 子组件(当前组件)通过 defineEmits 获取 emit 函数
const emit = defineEmits<{
  (e: 'clickRight'): void // 从 Vant 4 开始，所有的事件均采用 Vue 官方推荐的驼峰格式进行命名
}>()
const onClickRight = () => {
  // 点击右侧文字按钮，执行的逻辑
  // 子组件(当前组件)通过 emit 触发事件，也可以传递数据
  emit('clickRight') // 从 Vant 4 开始，所有的事件均采用 Vue 官方推荐的驼峰格式进行命名
}
</script>

<template>
  <!-- vant组件 NavBar 导航栏 -->
  <van-nav-bar
    fixed
    left-arrow
    @click-left="onClickLeft"
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
