<!-- 支付方式的动作面板组件 -->
<!-- 极速问诊ConsultPay.vue、问诊订单ConsultDetail.vue和药品订单中都会用到 -->

<script setup lang="ts">
import { getConsultOrderPayUrl } from '@/services/consult'
import { showToast } from 'vant'
import { ref } from 'vue'

// 使用该组件的父组件需要传过来的数据
const props = defineProps<{
  orderId: string // 订单id
  show: boolean // 控制动作面板显示与隐藏
  actualPayment: number // 实付金额
  onClose?: () => void // 关闭动作面板前的回调函数，返回 false 可阻止关闭。可选。极速问诊中需要进行关闭当作面板前的操作->显示 Dialog 弹出框，问诊订单和药品订单中不需要...直接关闭即可
  payCallback: string // 支付成功后跳转的地址
}>()

const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

// 定义支付方式的响应式数据，0或1
const paymentMethod = ref<0 | 1>()

// 定义立即支付按钮的点击事件的事件处理函数
const pay = async () => {
  // if条件不可以写成!paymentMethod.value，因为paymentMethod.value可能为0或1，而0是false...
  if (paymentMethod.value === undefined) return showToast('请选择支付方式')
  // 类型守卫
  if (props.orderId) {
    // 调用订单-支付接口获取支付需要跳转的url
    const res = await getConsultOrderPayUrl({
      // 支付方式
      paymentMethod: paymentMethod.value,
      // 订单id
      orderId: props.orderId, // 会提示不能将类型"string | undefined"分配给类型string。所以需要类型守卫if(orderId.value){}
      // 支付成功后跳转的地址
      payCallback: props.payCallback
    })
    // 跳转到支付的url 没有使用路由跳转 而是原生的浏览器跳转
    window.location.href = res.data.payUrl // window.location.href 不仅可以获取当前地址，还可以赋予新的地址
  }
}
</script>

<template>
  <div class="cp-pay-sheet">
    <!-- Vant 4 组件 ActionSheet 动作面板 -->
    <!-- v-model:show属性	是否显示动作面板 -->
    <!-- title属性	顶部标题 -->
    <!-- closeable属性	是否显示关闭图标 -->
    <!-- before-close属性	关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise -->
    <!-- close-on-popstate属性	是否在页面回退时自动关闭。注：因为想要点击浏览器的返回和支付页面左上角的返回按钮进行拦截不进行页面跳转 -->
    <!-- v-model语法糖 -->
    <!-- 父组件通过props属性将show传给子组件，子组件通过emit方法触发父组件修改show -->
    <!-- 因为props只读，不能修改，不是响应式数据，所以不能使用v-model:show="show。而是:show="show" @update:show="emit('update:show', $event)" -->
    <van-action-sheet
      :show="show"
      @update:show="emit('update:show', $event)"
      title="选择支付方式"
      :closeable="false"
      :before-close="onClose"
      :close-on-popstate="false"
    >
      <div class="pay-type">
        <p class="amount">￥{{ actualPayment.toFixed(2) }}</p>
        <van-cell-group>
          <!-- 支付接口中的支付方式是paymentMethod，其中0是微信支付，1是支付宝支付 -->
          <van-cell title="微信支付" @click="paymentMethod = 0">
            <template #icon><cp-icon name="consult-wechat"></cp-icon></template>
            <!-- checkbox的checked属性为true时表示选中 -->
            <template #extra><van-checkbox :checked="paymentMethod === 0"></van-checkbox></template>
          </van-cell>
          <van-cell title="支付宝支付" @click="paymentMethod = 1">
            <template #icon><cp-icon name="consult-alipay"></cp-icon></template>
            <template #extra><van-checkbox :checked="paymentMethod === 1"></van-checkbox></template>
          </van-cell>
        </van-cell-group>
        <div class="btn">
          <van-button type="primary" round block @click="pay">立即支付</van-button>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<style lang="scss" scoped>
.pay-type {
  .amount {
    padding: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .btn {
    padding: 15px;
  }
  .van-cell {
    align-items: center;
    .cp-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .van-checkbox :deep(.van-checkbox__icon) {
      font-size: 16px;
    }
  }
}
</style>
