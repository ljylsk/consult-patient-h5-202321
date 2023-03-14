<!-- 医生问诊室顶部订单状态组件 -->

<script setup lang="ts">
import { defineProps } from 'vue'
import { OrderState } from '@/enums'

// Props解构默认值，需要在vite.config.ts中显式地选择开启响应式语法糖
const { status, countdown = 0 } = defineProps<{
  status?: OrderState // 订单状态
  countdown?: number // 倒计时(单位s)
}>()
</script>

<template>
  <div class="room-status">
    <!-- 订单状态为待接诊时显示此内容 -->
    <div class="wait" v-if="status === OrderState.ConsultWait">
      已通知医生尽快接诊，24小时内医生未回复将自动退款
    </div>
    <!-- 订单状态为问诊中时显示此内容 -->
    <div class="chat" v-if="status === OrderState.ConsultChat">
      <span>咨询中</span>
      <!-- Vant 4 组件 CountDown 倒计时 -->
      <span>剩余时间：<van-count-down :time="countdown * 1000" /></span>
    </div>
    <!-- 订单状态为取消问诊或问诊完成时显示此内容 -->
    <div
      class="end"
      v-if="status === OrderState.ConsultCancel || status === OrderState.ConsultComplete"
    >
      <van-icon name="passed" /> 已结束
    </div>
  </div>
</template>

<style lang="scss" scoped>
.room-status {
  position: fixed;
  left: 0;
  top: 46px;
  height: 44px;
  width: 100%;
  background-color: #fff;
  font-size: 13px;
  z-index: 1;
  .wait {
    padding: 0 15px;
    background-color: var(--cp-plain);
    height: 100%;
    line-height: 44px;
    text-align: center;
    color: var(--cp-primary);
  }
  .chat {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    span {
      &:first-child {
        color: var(--cp-primary);
      }
      &:last-child {
        color: var(--cp-text2);
        width: 130px;
        .van-count-down {
          display: inline;
        }
      }
    }
  }
  .end {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 15px;
    font-weight: 500;
    .van-icon {
      font-size: 14px;
      margin-right: 4px;
      position: relative;
      top: 1px;
    }
  }
}
</style>
