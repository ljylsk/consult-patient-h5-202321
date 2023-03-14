<!-- 极速问诊页面 -->

<script setup lang="ts">
// 导入问诊仓库
import { useRouter } from 'vue-router'
import { useConsultStore } from '@/stores'
// 调用useConsultStore()，创建store实例
const store = useConsultStore()
const router = useRouter()
// 定义顶部导航栏右侧文字 问诊记录 的点击事件的处理函数
const clickRight = () => {
  // 跳转至问诊记录页面
  router.push('/User/consult')
}
</script>

<template>
  <div class="consult-fast-page">
    <!-- 父组件(当前组件)在子组件cp-nav-bar上绑定自定义事件clickRight，事件处理函数为clickRight -->
    <cp-nav-bar title="极速问诊" right-text="问诊记录" @clickRight="clickRight"></cp-nav-bar>
    <div class="fast-logo">
      <img class="img" src="@/assets/consult-fast.png" alt="" />
      <p class="text"><span>20s</span> 快速匹配专业医生</p>
    </div>
    <div class="fast-type">
      <!-- 点击三甲图文问诊，记录下极速问诊类型是三甲，跳转至选择科室页面 ConsultDep.vue -->
      <router-link to="/consult/dep" class="item" @click="store.setIllnessType(1)">
        <cp-icon class="pic" name="consult-doctor"></cp-icon>
        <div class="info">
          <p>三甲图文问诊</p>
          <p>三甲主治及以上级别医生</p>
        </div>
        <van-icon name="arrow"></van-icon>
      </router-link>
      <!-- 点击普通图文问诊，记录下极速问诊类型是普通，跳转至选择科室页面 ConsultDep.vue -->
      <router-link to="/consult/dep" class="item" @click="store.setIllnessType(0)">
        <cp-icon class="pic" name="consult-message"></cp-icon>
        <div class="info">
          <p>普通图文问诊</p>
          <p>二甲主治及以上级别医生</p>
        </div>
        <van-icon name="arrow"></van-icon>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.consult-fast-page {
  padding-top: 46px;
  .fast-logo {
    padding: 30px 0;
    text-align: center;
    .img {
      width: 240px;
    }
    .text {
      font-size: 16px;
      margin-top: 10px;
      > span {
        color: var(--cp-primary);
      }
    }
  }
  .fast-type {
    padding: 15px;
    .item {
      display: flex;
      padding: 16px;
      border-radius: 4px;
      align-items: center;
      margin-bottom: 16px;
      border: 0.5px solid var(--cp-line);
    }
    .pic {
      width: 40px;
      height: 40px;
    }
    .info {
      margin-left: 12px;
      flex: 1;
      > p:first-child {
        font-size: 16px;
        color: var(--cp-text1);
        margin-bottom: 4px;
      }
      > p:last-child {
        font-size: 13px;
        color: var(--cp-tag);
      }
    }
    .van-icon {
      color: var(--cp-tip);
    }
  }
}
</style>
