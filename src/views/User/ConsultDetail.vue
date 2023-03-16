<!-- 问诊详情页面组件 -->

<script setup lang="ts">
import { getConsultOrderDetail } from '@/services/consult'
import type { ConsultOrderItem } from '@/types/consult'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OrderState } from '@/enums'
// 导入获取患病时间的文字的方法和获取是否就诊过的文字的方法
import { getConsultFlagText, getIllnessTimeText } from '@/utils/filter'
import { useDeleteOrder, useOrderCancel, useShowPrescription } from '@/composable'
// 导入VueUse的useClipboard函数，剪贴板
import { useClipboard } from '@vueuse/core'
import { showFailToast, showSuccessToast } from 'vant'

// 调用useRoute()，获取当前路由地址
const route = useRoute()
// 定义订单(问诊)详情的响应式数据
const item = ref<ConsultOrderItem>()
onMounted(async () => {
  const res = await getConsultOrderDetail(route.params.id as string) // as 类型断言，否则会提示：类型“string | string[]”的参数不能赋给类型“string”的参数。route.params.id可能为 string | string[]，而定义接口函数getConsultOrderDetail时，形参的TS类型是string
  // 查询订单详情信息的接口函数getConsultOrderDetail的形参是orderId(订单id)，在调用接口函数时，实参应该是当前路由地址中的id值，而不是orderId(订单id)。因为问诊详情页面路由规则中的路由地址是'/user/consult/:id'。
  item.value = res.data
})

// 调用取消订单的逻辑函数useOrderCancel，从函数返回值中解构出loading变量和onCancelOrder函数
// 相当于在此处定义函数onCancelOrder和变量loading，然后点击取消订单时调用onCancelOrder函数
const { loading, onCancelOrder } = useOrderCancel()

// 调用删除订单的逻辑函数useDeleteOrder时传入实参(调用删除订单接口成功后的函数)，并从函数返回值中解构出loading变量和deleteConsultOrder函数。
// 相当于在此处定义函数deleteConsultOrder和变量loading，然后点击删除订单时调用deleteConsultOrder函数
// 前面已经有loading变量了，这里将loading重命名为deleteLoading
// 调用useRouter()，获取路由实例
const router = useRouter()
const { loading: deleteLoading, deleteConsultOrder } = useDeleteOrder(() => {
  // 跳转至问诊记录页面
  router.push('/user/consult')
})

// 查看处方
// 调用useShowPrescription()查看处方的逻辑函数，从函数返回值中解构出showPrescription函数
// 相当于在此处定义函数showPrescription，然后点击原始处方时调用showPrescription函数
const { showPrescription } = useShowPrescription()

// 复制订单编号：使用VueUse的useClipboard函数
// 1. copy(需要拷贝的内容)
// 2. copied 是否拷贝成功，默认1.5s恢复状态
// 3. isSupported 浏览器是否支持，需要授权读取粘贴板和写入粘贴板权限
const { copy, copied, isSupported } = useClipboard()
// 定义 复制 的点击事件的事件处理函数
const onCopy = () => {
  // 如果浏览器不支持剪贴板，Toast 轻提示
  if (!isSupported) return showFailToast('未授权，不支持')
  // 复制
  copy(item.value?.orderNo as string) // as 类型断言
}
// 侦听copied
watch(copied, () => {
  if (copied.value) showSuccessToast('复制成功')
})

// 继续支付：
// 定义点击继续支付控制动作面板显示与隐藏的响应式数据
const show = ref(false)
</script>

<template>
  <div class="consult-detail-page" v-if="item">
    <cp-nav-bar title="问诊详情" />
    <div class="detail-head">
      <div class="text">
        <h3>图文问诊 {{ item.payment }} 元</h3>
        <!-- 动态添加类名:class="{}"   当订单状态为ConsultPay待支付时，添加类名orange，显示对应的style样式；订单状态为ConsultChat问诊中时，添加类名green，显示对应的style样式 -->
        <span
          class="sta"
          :calss="{
            orange: item.status === OrderState.ConsultPay,
            green: item.status === OrderState.ConsultChat
          }"
          >{{ item.statusValue }}</span
        >
        <p class="tip">服务医生信息</p>
      </div>
      <div class="card">
        <img class="avatar" src="@/assets/avatar-doctor.svg" alt="" />
        <p class="doc">
          <span>极速问诊</span>
          <span>自动分配医生</span>
        </p>
        <van-icon name="arrow" />
      </div>
    </div>
    <div class="detail-patient">
      <van-cell-group :border="false">
        <van-cell
          title="患者信息"
          :value="`${item.patientInfo.name} | ${item.patientInfo.genderValue} | ${item.patientInfo.age}岁`"
        />
        <!-- item.illnessTime 和 item.consultFlag 得到的是数字，需要将数字转换为相应的文字。其方法在医生问诊室消息卡片组件RoomMessage.vue中定义过，将两个方法封装起来复用，详见@/utils/filter.ts -->
        <!-- <van-cell title="患病时长" :value="item.illnessTime" /> -->
        <van-cell title="患病时长" :value="getIllnessTimeText(item.illnessTime)" />
        <!-- <van-cell title="就诊情况" :value="item.consultFlag" /> -->
        <van-cell title="就诊情况" :value="getConsultFlagText(item.consultFlag)" />
        <van-cell title="病情描述" :label="item.illnessDesc" />
      </van-cell-group>
    </div>
    <div class="detail-order">
      <h3>订单信息</h3>
      <van-cell-group :border="false">
        <van-cell title="订单编号">
          <template #value>
            <span class="copy" @click="onCopy">复制</span>
            {{ item.orderNo }}
          </template>
        </van-cell>
        <van-cell title="创建时间" :value="item.createTime" />
        <van-cell title="应付款" :value="`￥${item.payment}`" />
        <van-cell title="优惠券" :value="`-￥${item.couponDeduction}`" />
        <van-cell title="积分抵扣" :value="`-￥${item.pointDeduction}`" />
        <van-cell title="实付款" :value="`￥${item.actualPayment}`" class="price" />
      </van-cell-group>
    </div>
    <!-- 以下按钮与问诊记录页面中的按钮逻辑相同，只有style样式不同 -->
    <!-- 订单状态为ConsultPay = 1待支付时，显示以下内容 -->
    <!-- van-hairline--top 为 Vant4 Style 内置样式 => 上边框 -->
    <div class="detail-action van-hairline--top" v-if="item.status === OrderState.ConsultPay">
      <!-- 支付倒计时 -->
      <div class="detail-time">
        <!-- Vant 4 组件 CountDown 倒计时：用于实时展示倒计时数值，支持毫秒精度 -->
        请在<van-count-down :time="item.countdown * 1000"></van-count-down
        >内完成支付，超时订单将取消
      </div>
      <div class="price">
        <span>需付款</span>
        <span>￥{{ item.actualPayment }}</span>
      </div>
      <!-- 函数onCancelOrder的形参的TS类型是CancelOrderItem，非空，而调用函数onCancelOrder时传入实参item会提示：类型“CancelOrderItem | undefined”的参数不能赋给类型“CancelOrderItem”的参数。需要给item加上非空断言操作符(!) -->
      <!-- 非空断言操作符操作符 ! 可以用于断言操作对象是非 null 和非 undefined 类型。即： item! 将从 item 值域中排除 null 和 undefined -->
      <van-button type="default" round :loading="loading" @click="onCancelOrder(item!)"
        >取消订单</van-button
      >
      <van-button type="primary" round @click="show = true">继续支付</van-button>
    </div>
    <!-- 订单状态为ConsultWait = 2待接诊时，显示以下按钮 -->
    <div class="detail-action van-hairline--top" v-if="item.status === OrderState.ConsultWait">
      <van-button type="default" round :loading="loading" @click="onCancelOrder(item!)"
        >取消订单</van-button
      >
      <van-button type="primary" round :to="`/room?orderId=${item.id}`">继续沟通</van-button>
    </div>
    <!-- 订单状态为ConsultChat = 3问诊中时，显示以下按钮 -->
    <div class="detail-action van-hairline--top" v-if="item.status === OrderState.ConsultChat">
      <van-button
        type="default"
        round
        v-if="item.prescriptionId"
        @click="showPrescription(item?.prescriptionId)"
        >查看处方</van-button
      >
      <van-button type="primary" round :to="`/room?orderId=${item.id}`">继续沟通</van-button>
    </div>
    <!-- 订单状态为ConsultComplete = 4问诊完成时，显示以下按钮 -->
    <div class="detail-action van-hairline--top" v-if="item.status === OrderState.ConsultComplete">
      <cp-consult-more
        :disabled="!item.prescriptionId"
        @onPreview="showPrescription(item?.prescriptionId)"
        @onDelete="deleteConsultOrder(item!)"
      ></cp-consult-more>
      <van-button type="default" round :to="`/room?orderId=${item.id}`">问诊记录</van-button>
      <van-button type="primary" round v-if="item.evaluateId">写评价</van-button>
      <van-button type="default" round v-else>查看评价</van-button>
    </div>
    <!-- 订单状态为ConsultCancel = 5取消问诊时，显示以下按钮 -->
    <div class="detail-action van-hairline--top" v-if="item.status === OrderState.ConsultCancel">
      <!-- !非空断言操作符 -->
      <van-button type="default" round :loading="deleteLoading" @click="deleteConsultOrder(item!)"
        >删除订单</van-button
      >
      <van-button type="primary" round to="/">咨询其他医生</van-button>
    </div>

    <!-- 点击 继续支付 按钮显示的动作面板： -->
    <!-- vue3 中 v-model:show 语法糖【v-model:show="show" 相当于 :show="show"和@update:show="show =
    $event"】 父组件(当前组件)将show值传给子组件CpPaySheet.vue，子组件通知父组件修改show值 -->
    <!-- http://localhost:5173/room 为医生问诊室页面的路由地址，详见约定路由规则 -->
    <!-- 因为服务器监听的端口号是5173，所以浏览器访问的端口号也要是5173，如果地址不一致会导致无法访问。不写端口号的话默认是8080 -->
    <cp-pay-sheet
      v-model:show="show"
      :orderId="item?.id"
      :actualPayment="item?.actualPayment"
      payCallback="http://localhost:5173/room"
    ></cp-pay-sheet>
  </div>

  <!-- 骨架屏：当网速很慢、订单详情数据item未加载出来时，显示的内容 -->
  <div class="consult-detail-page" v-else>
    <cp-nav-bar title="问诊详情" />
    <!-- Vant 4 组件 Skeleton 骨架屏：用于在内容加载过程中展示一组占位图形 -->
    <!-- 通过 title 属性显示标题占位图，通过 row 属性配置占位段落行数 -->
    <van-skeleton title :row="4" style="margin-top: 30px" />
    <van-skeleton title :row="4" style="margin-top: 30px" />
  </div>
</template>

<style lang="scss" scoped>
.consult-detail-page {
  padding: 46px 0 110px 0;
}
.detail-head {
  height: 140px;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 135px;
    background: linear-gradient(180deg, rgba(44, 181, 165, 0), rgba(44, 181, 165, 0.2));
    border-bottom-left-radius: 150px 20px;
    border-bottom-right-radius: 150px 20px;
  }
  padding: 15px;
  .text {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 10px 3px;
    .sta {
      color: var(--cp-tag);
      font-weight: 500;
      font-size: 16px;
      &.green {
        color: var(--cp-primary);
      }
      &.orange {
        color: #f2994a;
      }
    }
    .tip {
      width: 100%;
      color: var(--cp-text3);
      margin-top: 5px;
    }
  }
  .card {
    height: 74px;
    background-color: #fff;
    border-radius: 8px;
    position: relative;
    display: flex;
    align-items: center;
    padding: 0 15px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    .avatar {
      width: 38px;
      height: 38px;
    }
    .doc {
      flex: 1;
      padding-left: 15px;
      > span {
        display: block;
        font-size: 16px;
        &:last-child {
          font-size: 13px;
          color: var(--cp-text3);
        }
      }
    }
    .van-icon {
      color: var(--cp-tip);
    }
  }
}
.detail-patient {
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
  }
}
.detail-order {
  > h3 {
    padding: 10px 18px;
    font-weight: normal;
  }
  .copy {
    padding: 2px 10px;
    border: 1px solid var(--cp-primary);
    background-color: var(--cp-plain);
    color: var(--cp-primary);
    font-size: 12px;
    border-radius: 12px;
    margin-right: 10px;
  }
  :deep(.van-cell__title) {
    width: 70px;
    flex: none;
  }
  .price :deep(.van-cell__value) {
    font-size: 16px;
    color: var(--cp-price);
  }
}
.detail-action {
  height: 65px;
  width: 100%;
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  background-color: #fff;
  justify-content: flex-end;
  padding: 0 15px;
  box-sizing: border-box;
  .price {
    flex: 1;
    > span:last-child {
      font-size: 18px;
      color: var(--cp-price);
      padding-left: 5px;
    }
  }
  .van-button {
    margin-left: 10px;
    padding-left: 17px;
    padding-right: 17px;
  }
  :deep(.van-button--default) {
    background-color: var(--cp-bg);
    color: var(--cp-text3);
  }
}
.van-cell {
  padding-left: 18px;
  padding-right: 18px;
}
.detail-time {
  position: fixed;
  left: 0;
  bottom: 65px;
  width: 100%;
  height: 44px;
  background-color: #fff7eb;
  text-align: center;
  line-height: 44px;
  font-size: 13px;
  color: #f2994a;
  .van-count-down {
    display: inline;
    color: #f2994a;
  }
}
</style>
