<!-- 问诊记录页面组件 -->

<script setup lang="ts">
import { ref } from 'vue'
import ConsultList from './components/ConsultList.vue'
import { ConsultType } from '@/enums'
const active = ref()
</script>

<template>
  <div class="consult-page">
    <cp-nav-bar title="问诊记录"></cp-nav-bar>
    <!-- Vant 4 组件 Tab 标签页 -->
    <!-- 通过 sticky 属性可以开启粘性布局，粘性布局下，标签页滚动到顶部时会自动吸顶 -->
    <!-- 通过 v-model:active 绑定当前激活标签对应的索引值，默认情况下启用第一个标签 -->
    <van-tabs v-model:active="active" sticky>
      <!-- 通过就诊类型区分标签，为什么要用type属性，因为问诊记录-订单列表接口中的一个查询参数是type，将type属性值传给组件consultList.vue，组件中用props属性type接收，作为查询参数调用接口获取问诊记录中的订单列表 -->
      <van-tab title="极速问诊"><consult-list :type="ConsultType.Fast"></consult-list></van-tab>
      <van-tab title="找医生"><consult-list :type="ConsultType.Doctor"></consult-list></van-tab>
      <van-tab title="开药问诊"
        ><consult-list :type="ConsultType.Medication"></consult-list
      ></van-tab>
    </van-tabs>
  </div>
</template>

<style lang="scss" scoped>
.consult-page {
  padding-top: 46px;
  background-color: var(--cp-bg);
  min-height: calc(100vh - 46px);
}
</style>
