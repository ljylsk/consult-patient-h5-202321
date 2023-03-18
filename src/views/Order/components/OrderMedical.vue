<!-- 药品订单列表组件 -->

<script setup lang="ts">
import type { Medicines } from '@/types/room'

// 使用props属性medicines接收父组件传过来的处方的药品信息
// 处方的药品信息默认为空
const { medicines = [] } = defineProps<{
  medicines: Medicines[]
}>()
</script>

<template>
  <div class="order-medical">
    <div class="head">
      <h3>优医药房</h3>
      <small>优医质保 假一赔十</small>
    </div>
    <!-- 遍历药品信息数组 -->
    <div class="item van-hairline--top" v-for="med in medicines" :key="med.id">
      <!-- 药品图片 -->
      <img class="img" :src="med.avatar" alt="" />
      <div class="info">
        <p class="name">
          <!-- 药品名称 -->
          <span>{{ med.name }}</span>
          <!-- 药品数量 -->
          <span>x{{ med.quantity }}</span>
        </p>
        <p class="size">
          <!-- 如果是处方药，显示处方药标签 -->
          <van-tag v-if="med.prescriptionFlag === 1">处方药</van-tag>
          <!-- 药品规格 -->
          <span>{{ med.specs }}</span>
        </p>
        <!-- 药品价格 -->
        <p class="price">￥{{ med.amount }}</p>
      </div>
      <!-- 药品用法用量 -->
      <div class="desc">用法用量：{{ med.usageDosag }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-medical {
  background-color: #fff;
  padding: 0 15px;
  .head {
    display: flex;
    height: 54px;
    align-items: center;
    > h3 {
      font-size: 16px;
      font-weight: normal;
    }
    > small {
      font-size: 13px;
      color: var(--cp-tag);
      margin-left: 10px;
    }
  }
  .item {
    display: flex;
    flex-wrap: wrap;
    padding: 15px 0;
    .img {
      width: 80px;
      height: 70px;
      border-radius: 2px;
      overflow: hidden;
    }
    .info {
      padding-left: 15px;
      width: 250px;
      .name {
        display: flex;
        font-size: 15px;
        margin-bottom: 5px;
        > span:first-child {
          width: 200px;
        }
        > span:last-child {
          width: 50px;
          text-align: right;
        }
      }
      .size {
        margin-bottom: 5px;
        .van-tag {
          background-color: var(--cp-primary);
          vertical-align: middle;
        }
        span:not(.van-tag) {
          margin-left: 10px;
          color: var(--cp-tag);
          vertical-align: middle;
        }
      }
      .price {
        font-size: 16px;
        color: #eb5757;
      }
    }
    .desc {
      width: 100%;
      background-color: var(--cp-bg);
      border-radius: 4px;
      margin-top: 10px;
      padding: 4px 10px;
      color: var(--cp-tip);
    }
  }
}
</style>
