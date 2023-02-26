<!-- 首页的推荐关注医生 组件 -->

<script setup lang="ts">
// 注意：只有vant组件和src/components/下的组件才不需import~
import DoctorCard from '@/views/Home/components/DoctorCard.vue'
// 导入动态窗口大小的插件
import { useWindowSize } from '@vueuse/core'
import { ref, onMounted } from 'vue'
// 按需导入TS类型
import type { DoctorList } from '@/types/consult'
// 按需导入接口
import { getDoctorPage } from '@/services/consult'

const { width } = useWindowSize()

/* // 如果自己实现：组件初始化计算滑块宽度即滚动的宽度，当页面尺寸改变时重新计算，组件销毁需要清除计算滑块宽度的事件
const width = ref(150)
const setWidth = () => (width.value = ( 150 / 375 ) * window.innerWidth)
// 组件挂载完成后执行~
onMounted(() => {
  setWidth()
  window.addEventListener('resize', setWidth) // resize 窗口大小发生变化时触发的事件
})
// 组件实例被卸载之后调用~
onUnmounted(() => {
  window.removeEventListener('resize', setWidth)
}) */

// 定义关注的医生列表的响应式数据
const list = ref<DoctorList>([])
// 组件挂载完成后执行~
onMounted(async () => {
  // 调用关注的医生列表接口获取数据
  const res = await getDoctorPage({ current: 1, pageSize: 5 })
  // 更新关注的医生列表数据
  list.value = res.data.rows
})
</script>

<template>
  <div class="follow-doctor">
    <div className="head">
      <p>推荐关注</p>
      <a href="javascript:;"> 查看更多<i class="van-icon van-icon-arrow" /></a>
    </div>
    <div class="body">
      <!-- Vant 4 组件 swipe 轮播 -->
      <!-- loop属性 是否开启循环播放；show-indicators属性 是否显示指示器；width属性 滑块宽度，单位为 px -->
      <!-- 此设计图是按移动端屏幕宽度为375px设计的，滑块宽度应为150=(一个医生卡片宽度135 + 一个内边距宽度15)。当屏幕宽度变化时，滑块宽度需要重新计算，通过@vueuse/core实现 -->
      <van-swipe :loop="false" :show-indicators="false" :width="(150 / 375) * width">
        <van-swipe-item v-for="item in list" :key="item.id">
          <!-- 将关注的医生列表中的每一项即医生卡片对象传给doctor-card组件进行数据渲染 -->
          <doctor-card :item="item"></doctor-card>
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.follow-doctor {
  background-color: var(--cp-bg);
  height: 250px;
  .head {
    display: flex;
    justify-content: space-between;
    height: 45px;
    align-items: center;
    padding: 0 15px;
    font-size: 13px;
    > a {
      color: var(--cp-tip);
    }
  }
  .body {
    width: 100%;
    overflow: hidden;
  }
}
</style>
