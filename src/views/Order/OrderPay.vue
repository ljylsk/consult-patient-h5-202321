<!-- 药品支付页面 -->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { AddressItem, OrderPre } from '@/types/order'
import { getMedicalOrderPre, getAddressList, createMedicalOrder } from '@/services/order'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'

// 获取当前路由地址
const route = useRoute()
// 定义药品支付的收货地址(唯一)
const address = ref<AddressItem>()
// 定义药品订单预支付信息的响应式数据
const orderPre = ref<OrderPre>()
// 组件挂载时调用~
onMounted(async () => {
  // 调用接口获取药品订单预支付信息，请求参数处方id通过路由地址获取
  const res = await getMedicalOrderPre({ prescriptionId: route.query.id as string })
  orderPre.value = res.data
  // 调用获取收货地址列表接口
  const addRess = await getAddressList()
  if (addRess.data.length) {
    // 如果有收货地址，在收货地址列表中寻找默认收货地址
    const defAddress = addRess.data.find((item) => item.isDefault === 1)
    // 有默认收货地址使用默认收货地址
    if (defAddress) address.value = defAddress
    // 没有默认收货地址使用第一个收货地址
    else address.value = addRess.data[0]
  }
})

// 支付：
// 定义复选框(我已同意支付协议)勾选状态的响应式数据
const checked = ref(false)
// 定义订单id的响应式数据
const orderId = ref('')
// 定义是否显示将继续支付按钮显示为加载中状态的响应式数据
const loading = ref(false)
// 定义控制支付方式的动作面板的显示与隐藏的响应式数据
const show = ref(false)
// 定义 立即支付 按钮的点击事件的事件处理函数
const pay = async () => {
  // 未勾选支付协议，Toast 轻提示
  if (!checked.value) return showToast('请勾选支付协议')
  if (!address.value?.id) return showToast('请选择收货地址')
  if (!orderPre.value?.id) return showToast('没有处方id')
  // 显示继续支付按钮的加载中状态
  loading.value = true
  try {
    // 调用接口获取订单id
    const res = await createMedicalOrder({
      id: orderPre.value?.id,
      couponId: orderPre.value?.couponId,
      addressId: address.value?.id
    })
    orderId.value = res.data.id
    // 显示支付方式的动作面板
    show.value = true
  } catch (e) {
    // 隐藏继续支付按钮的加载中状态
    loading.value = false
  }
}
</script>

<template>
  <div class="order-pay-page" v-if="address && orderPre">
    <cp-nav-bar title="药品支付" />
    <div class="order-address">
      <p class="area">
        <van-icon name="location" />
        <!-- 省 市 区县 -->
        <span>{{ address.province }}{{ address.city }}{{ address.country }}</span>
      </p>
      <!-- 详细地址 -->
      <p class="detail">{{ address.addressDetail }}</p>
      <!-- 收货人姓名 联系方式 -->
      <p>{{ address.receiver }} {{ address.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}</p>
    </div>
    <div class="order-medical">
      <div class="head">
        <h3>优医药房</h3>
        <small>优医质保 假一赔十</small>
      </div>
      <!-- 遍历药品信息数组 -->
      <div class="item van-hairline--top" v-for="med in orderPre.medicines" :key="med.id">
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
    <div class="order-detail">
      <van-cell-group>
        <van-cell title="药品金额" :value="`￥${orderPre.payment}`" />
        <van-cell title="运费" :value="`￥${orderPre.expressFee}`" />
        <van-cell title="优惠券" :value="`-￥${orderPre.couponDeduction}`" />
        <van-cell title="实付款" :value="`￥${orderPre.actualPayment}`" class="price" />
      </van-cell-group>
    </div>
    <div class="order-tip">
      <p class="tip">
        由于药品的特殊性，如非错发、漏发药品的情况，药品一经发出
        不得退换，请核对药品信息无误后下单。
      </p>
      <van-checkbox v-model="checked">我已同意<a href="javascript:;">支付协议</a></van-checkbox>
    </div>
    <!-- Vant 4 组件 SubmitBar 提交订单栏 -->
    <!-- loading属性	是否显示将按钮显示为加载中状态。加载状态下不会触发 submit 事件 -->
    <van-submit-bar
      :price="50 * 100"
      button-text="立即支付"
      button-type="primary"
      text-align="left"
      @click="pay"
    ></van-submit-bar>

    <!-- 支付方式的动作面板组件 -->
    <!-- vue3 中 v-model:show 语法糖【 v-model:show="show" 相当于 :show="show"和@update:show="show =
      $event"】 父组件(当前组件)将show值传给子组件CpPaySheet.vue，子组件通知父组件修改show值 -->
    <cp-pay-sheet
      v-model:show="show"
      :orderId="orderId"
      :actualPayment="orderPre?.actualPayment"
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
:deep(.van-nav-bar) {
  background-color: var(--cp-primary);
  .van-nav-bar__arrow,
  .van-nav-bar__title {
    color: #fff;
  }
}
:deep(.van-cell) {
  .van-cell__title {
    font-size: 16px;
  }
  .van-cell__value {
    font-size: 16px;
  }
  &.price {
    .van-cell__value {
      font-size: 18px;
      color: var(--cp-price);
    }
  }
}
:deep(.van-submit-bar) {
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  .van-button {
    width: 200px;
  }
}
.order-pay-page {
  padding: 46px 0 65px;
}
.order-address {
  padding: 15px 15px 0 15px;
  background-color: #fff;
  font-size: 13px;
  .area {
    color: var(--cp-tag);
    margin-bottom: 5px;
    .van-icon-location {
      color: #ff7702;
      font-size: 14px;
    }
  }
  .detail {
    font-size: 17px;
    margin-bottom: 5px;
  }
  &::after {
    content: '';
    display: block;
    height: 12px;
    background-color: var(--cp-bg);
    margin: 0 -15px;
    margin-top: 15px;
  }
}

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
.order-tip {
  padding: 0 15px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
  .tip {
    font-size: 12px;
    color: var(--cp-tag);
    width: 100%;
    &::before {
      content: '*';
      color: var(--cp-price);
      font-size: 14px;
    }
    margin-bottom: 30px;
  }
  .van-checkbox {
    a {
      color: var(--cp-primary);
    }
  }
}
</style>
