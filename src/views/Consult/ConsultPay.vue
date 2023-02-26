<!-- 问诊 - 支付页面 -->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// 导入TS类型
import type { ConsultOrderPreData } from '@/types/consult'
import type { Patient } from '@/types/user'
// 导入接口函数
import { getConsultOrderPre, createConsultOrder, getConsultOrderPayUrl } from '@/services/consult'
import { getPatientDetail } from '@/services/user'
// 导入问诊仓库
import { useConsultStore } from '@/stores'
import { showConfirmDialog, showDialog, showToast } from 'vant'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

// 支付信息：
// 调用useConsultStore()，创建store实例
const store = useConsultStore()
// 定义就诊信息和抵扣信息的响应式数据
const payInfo = ref<ConsultOrderPreData>()
// 定义获取就诊信息和抵扣信息的函数
const loadPayInfo = async () => {
  // 调用计算就诊信息和抵扣信息接口
  const res = await getConsultOrderPre({
    type: store.consult.type,
    illnessType: store.consult.illnessType
  })
  payInfo.value = res.data
  // 存储优惠券id到问诊仓库，后面调用保存问诊订单接口返回问诊订单id时需要用到优惠券id的数据
  store.setCoupon(res.data.couponId)
}

// 患者信息：
// 定义患者详情的响应式数据
const patientInfo = ref<Patient>()
// 定义获取患者详情的函数
const loadPatient = async () => {
  if (store.consult.patientId) {
    const res = await getPatientDetail(store.consult.patientId) // 因为patientId是可选属性，有可能是undefined，提示 类型“string | undefined”的参数不能赋给类型“string”的参数，所以需要类型守卫即逻辑判断if
    patientInfo.value = res.data
  }
}

// 组件挂载完成后执行~
onMounted(() => {
  // 打开动作面板生成订单id后，问诊记录清空。在立即支付前若刷新页面，需要校验
  if (
    !store.consult.type ||
    !store.consult.patientId ||
    !store.consult.illnessType ||
    !store.consult.depId
  ) {
    // 轻提示
    return showDialog({
      // 加return的原因： return 后就不会执行后面的逻辑了
      // 标题
      title: '温馨提示',
      // 文本内容
      message: '问诊信息不完整请重新填写，如有未支付的问诊订单可在问诊记录中继续支付',
      // 是否在页面回退时自动关闭
      closeOnPopstate: false // 防止页面回退时弹出框关闭
    }).then(() => {
      // 页面跳转到首页
      router.push('/')
    })
  }

  // 调用获取就诊信息和抵扣信息的函数
  loadPayInfo()
  // 调用获取患者详情的函数
  loadPatient()
})

// 打开动作面板生成问诊订单id：
// 定义绑定复选框勾选状态的响应式数据变量
const agree = ref(false)
// 定义显示隐藏动作面板的响应式数据变量
const show = ref(false)
// 定义支付方式的响应式数据变量【支付接口中的支付方式是paymentMethod，其中0是微信支付，1是支付宝支付】
const paymentMethod = ref<0 | 1>()
// 定义问诊订单id的响应式数据变量
const orderId = ref<string>()
// 定义按钮加载状态的响应式数据变量
const loading = ref(false)
// 定义支付页面(不是动作面板)的立即支付按钮点击事件的回调函数
const openSheet = async () => {
  if (!agree.value) return showToast('请勾选我已同意支付协议')
  // 显示加载状态
  loading.value = true
  // 调用保存问诊订单接口获取问诊订单id
  const res = await createConsultOrder(store.consult)
  orderId.value = res.data.id
  // 隐藏加载状态
  loading.value = false
  // 清空问诊仓库信息
  store.clear()
  // 打开动作面板
  show.value = true
}

// 动作面板的隐藏、关闭、返回、刷新、立即支付等：
// 1. 隐藏动作面板的关闭图标 => ActionSheet 动作面板的closeable属性
// 2. 点击遮罩层(遮罩层：动作面板的黑色外围)关闭动作面板时【点击遮罩层后默认关闭动作面板】，确认框提示，点击 仍要关闭 按钮，跳转到问诊记录页面，点击 继续支付 按钮，关闭确认框
// 3. 如果已经生成问诊订单id回退时拦截
// 4. 调接口生成支付地址然后跳转
// 5. 刷新页面时即组件挂载完成后onMounted()，判断问诊记录是否存在，不存在就alert提示，确认后回到首页
const router = useRouter()
// 定义关闭动作面板前的回调函数，返回 false 可阻止关闭
const onClose = () => {
  // Vant 4 组件 Dialog 弹出框
  return showConfirmDialog({
    // 标题
    title: '关闭支付',
    // 文本内容
    message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',
    // 确认按钮文案
    confirmButtonText: '继续支付',
    // 取消按钮文案
    cancelButtonText: '仍要关闭'
  })
    .then(() => {
      // 点击 继续支付 按钮后的逻辑
      // 返回 false 阻止关闭
      return false
    })
    .catch(() => {
      // 点击 仍要关闭 按钮后的逻辑
      // 防止有orderId后，onBeforeRouteLeave会拦截，阻止跳转到问诊记录页面
      orderId.value = ''
      // 页面跳转到问诊记录页面
      router.push('/user/consult')
      // 返回 true 关闭
      return true
    })
}
// onBeforeRouteLeave 添加一个导航守卫，在当前位置的组件将要离开时触发。可以在任何组件中使用。当组件被卸载时，导航守卫将被移除
onBeforeRouteLeave(() => {
  // 如果已生成问诊订单id，则对返回(浏览器和页面两处的返回)进行拦截即点击返回时页面不跳转
  if (orderId.value) return false
})
// 立即支付
const pay = async () => {
  // if条件不可以写成!paymentMethod.value，因为paymentMethod.value可能为0或1，而0是false...
  if (paymentMethod.value === undefined) return showToast('请选择支付方式')
  // 类型守卫
  if (orderId.value) {
    // 调用订单-支付接口获取支付需要跳转的url
    const res = await getConsultOrderPayUrl({
      paymentMethod: paymentMethod.value,
      orderId: orderId.value, // 会提示不能将类型"string | undefined"分配给类型string。所以需要类型守卫if(orderId.value){}
      payCallback: 'http://localhost:5173/room'
    })
    // 跳转到支付的url 没有使用路由跳转 而是原生的浏览器跳转
    window.location.href = res.data.payUrl // window.location.href 不仅可以获取当前地址，还可以赋予新的地址
  }
}
</script>

<template>
  <!-- 因为payInfo和patientInfo最开始没有赋默认值，都是undefined，使用payInfo和patientInfo时会自动加上可选链? 可统一给最外层的盒子添加v-if属性，使用payInfo和patientInfo时就不用加可选链?了 -->
  <div class="consult-pay-page" v-if="payInfo && patientInfo">
    <cp-nav-bar title="支付"></cp-nav-bar>

    <div class="pay-info">
      <p class="tit">图文问诊 {{ payInfo.payment }} 元</p>
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p class="desc">
        <span>极速问诊</span>
        <span>自动分配医生</span>
      </p>
    </div>

    <!-- 支付信息 -->
    <!-- Vant 4 组件 Cell 单元格 -->
    <van-cell-group>
      <van-cell title="优惠券" :value="`-¥${payInfo.couponDeduction}`" />
      <van-cell title="积分抵扣" :value="`-¥${payInfo.pointDeduction}`" />
      <van-cell title="实付款" :value="`¥${payInfo.actualPayment.toFixed(2)}`" class="pay-price" />
    </van-cell-group>
    <div class="pay-space"></div>

    <!-- 患者信息 -->
    <van-cell-group>
      <van-cell
        title="患者信息"
        :value="`${patientInfo.name} | ${patientInfo.genderValue} | ${patientInfo.age}岁`"
      ></van-cell>
      <van-cell title="病情描述" :label="store.consult.illnessDesc"></van-cell>
    </van-cell-group>
    <div class="pay-schema">
      <!-- Vant 4 组件 Checkbox 复选框 -->
      <!-- 通过 v-model 绑定复选框的勾选状态 -->
      <van-checkbox v-model="agree">我已同意 <span class="text">支付协议</span></van-checkbox>
    </div>

    <!-- 底部按钮 -->
    <!-- Vant 4 组件 SubmitBar 提交订单栏 -->
    <!-- button-type属性	按钮类型 -->
    <!-- price属性	金额（单位分） -->
    <!-- button-text属性	按钮文字 -->
    <!-- text-align属性	金额文案对齐方向，可选值为 left -->
    <!-- 通过 loading 属性设置按钮为加载状态 -->
    <van-submit-bar
      button-type="primary"
      :price="payInfo.actualPayment * 100"
      button-text="立即支付"
      text-align="left"
      @click="openSheet"
      :loading="loading"
    />

    <!-- Vant 4 组件 ActionSheet 动作面板 -->
    <!-- v-model:show属性	是否显示动作面板 -->
    <!-- title属性	顶部标题 -->
    <!-- closeable属性	是否显示关闭图标 -->
    <!-- before-close属性	关闭前的回调函数，返回 false 可阻止关闭，支持返回 Promise -->
    <!-- close-on-popstate属性	是否在页面回退时自动关闭。注：因为想要点击浏览器的返回和支付页面左上角的返回按钮进行拦截不进行页面跳转 -->
    <van-action-sheet
      v-model:show="show"
      title="选择支付方式"
      :closeable="false"
      :before-close="onClose"
      :close-on-popstate="false"
    >
      <div class="pay-type">
        <p class="amount">￥{{ payInfo.actualPayment.toFixed(2) }}</p>
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

  <!-- Vant 4 组件 Skeleton 骨架屏：用于在内容加载过程中展示一组占位图形 -->
  <!-- 当网速慢时，会出现短暂的白屏情况，此时使用骨架屏占位 -->
  <div class="consult-pay-page" v-else>
    <van-skeleton title :row="3" />
    <van-skeleton title :row="4" />
    <van-skeleton title :row="5" />
  </div>
</template>

<style lang="scss" scoped>
.consult-pay-page {
  padding: 46px 0 50px 0;
}
.pay-info {
  display: flex;
  padding: 15px;
  flex-wrap: wrap;
  align-items: center;
  .tit {
    width: 100%;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .img {
    margin-right: 10px;
    width: 38px;
    height: 38px;
    border-radius: 4px;
    overflow: hidden;
  }
  .desc {
    flex: 1;
    > span {
      display: block;
      color: var(--cp-tag);
      &:first-child {
        font-size: 16px;
        color: var(--cp-text2);
      }
    }
  }
}
.pay-price {
  ::v-deep() {
    .vam-cell__title {
      font-size: 16px;
    }
    .van-cell__value {
      font-size: 16px;
      color: var(--cp-price);
    }
  }
}
.pay-space {
  height: 12px;
  background-color: var(--cp-bg);
}
.pay-schema {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  .text {
    color: var(--cp-primary);
  }
}
::v-deep() {
  .van-submit-bar__button {
    font-weight: normal;
    width: 160px;
  }
}
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
