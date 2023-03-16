<!-- 药品支付结果页面 -->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { OrderDetail } from '@/types/order'
import { getMedicalOrderDetail } from '@/services/order'
import { useRoute } from 'vue-router'
import { OrderState } from '@/enums'

// 药品订单详情信息的响应式数据
const order = ref<OrderDetail>()
// 获取当前路由地址
const route = useRoute()
onMounted(async () => {
  // 调用接口获取药品订单详情信息，请求参数id为订单id，从路由地址上获取
  const res = await getMedicalOrderDetail(route.query.orderId as string)
  order.value = res.data
})
</script>

<template>
  <!-- 如果药品订单详情信息order存在，则显示以下内容 -->
  <div class="order-pay-result-page" v-if="order">
    <cp-nav-bar title="药品支付结果" />
    <!-- 如果订单状态不是MedicinePay = 10待支付时，显示支付成功等以下内容 -->
    <div class="result" v-if="order.status !== OrderState.MedicinePay">
      <van-icon name="checked" />
      <p class="price">￥ {{ order.payment }}</p>
      <p class="status">支付成功</p>
      <p class="tip">订单支付成功，已通知药房尽快发出， 请耐心等待~</p>
      <div class="btn">
        <!-- Vant 4 组件 Button 按钮 -->
        <!-- to属性	点击后跳转的目标路由对象，等同于 vue-router 的 to 属性 -->
        <!-- 点击 查看订单 按钮，根据药品订单id跳转至药品订单详情页面，路由地址详见约定路由规则 -->
        <van-button type="primary" :to="`/user/consult/${order.id}`">查看订单</van-button>
        <!-- 点击 返回诊室 按钮，跳转至医生问诊室页面 -->
        <van-button :to="`/room?orderId=${order.roomId}`">返回诊室</van-button>
      </div>
    </div>
    <!-- 如果订单状态为MedicinePay = 10待支付时，显示支付失败等以下内容 -->
    <div class="result error" v-if="order.status === OrderState.MedicinePay">
      <van-icon name="clear" />
      <p class="price">￥ {{ order.payment }}</p>
      <p class="status">支付失败</p>
      <p class="tip">订单支付失败，可以点击查看订单继续支付，如有疑问联系客服~</p>
      <div class="btn">
        <!-- Vant 4 组件 Button 按钮 -->
        <!-- to属性	点击后跳转的目标路由对象，等同于 vue-router 的 to 属性 -->
        <!-- 点击 查看订单 按钮，根据药品订单id跳转至药品订单详情页面，路由地址详见约定路由规则 -->
        <van-button type="primary" :to="`/user/consult/${order.id}`">查看订单</van-button>
        <!-- 点击 返回诊室 按钮，跳转至医生问诊室页面 -->
        <van-button :to="`/room?orderId=${order.roomId}`">返回诊室</van-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-pay-result-page {
  padding-top: 46px;
}
.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  .van-icon {
    font-size: 75px;
    color: var(--cp-primary);
    margin-top: 60px;
  }
  .price {
    font-size: 22px;
    margin-top: 10px;
  }
  .status {
    color: var(--cp-text3);
  }
  .tip {
    color: var(--cp-tip);
    width: 240px;
    text-align: center;
    margin-top: 20px;
  }
  .btn {
    margin-top: 60px;
    .van-button--primary {
      margin-right: 20px;
    }
  }
  &.error {
    .van-icon {
      color: var(--cp-price);
    }
  }
}
</style>
