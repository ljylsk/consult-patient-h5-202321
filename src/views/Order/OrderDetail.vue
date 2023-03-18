<!-- 药品订单详情页面组件 -->

<script setup lang="ts">
import { useOrderDetail } from '@/composable'
import { useRoute, useRouter } from 'vue-router'
import OrderMedical from '@/views/Order/components/OrderMedical.vue'

// 获取当前路由地址
const route = useRoute()
// 调用useOrderDetail方法，获取药品订单详情信息order，并传入实参订单id，从当前路由地址上获取
// 当前页面路由地址是 http://localhost:5173/order/6876900575989760 所以是 route.params.id 而不是 route.query.id
const { order } = useOrderDetail(route.params.id as string)

const router = useRouter()
</script>

<template>
  <!-- 如果药品订单信息详情order存在，才显示以下内容。因为order是在组件挂载完成后才开始获取 -->
  <div class="order-detail-page" v-if="order">
    <cp-nav-bar title="药品订单详情" />
    <div class="order-head">
      <div class="card">
        <div class="logistics" @click="router.push(`/order/logistics/${order?.id}`)">
          <!-- 物流最新位置 -->
          <p>{{ order.expressInfo.content }}</p>
          <!-- 物流最新时间 -->
          <p>{{ order.expressInfo.time }}</p>
        </div>
        <van-icon name="arrow" />
      </div>
    </div>

    <!-- 药品支付页面OrderPay.vue也会使用下面这段代码，所以封装成药品订单列表组件复用。详见OrderMedical.vue -->
    <!-- <div class="order-medical">
      <div class="head">
        <h3>优医药房</h3>
        <small>优医质保 假一赔十</small>
      </div>
      <div class="item van-hairline--top" v-for="i in 2" :key="i">
        <img class="img" src="@/assets/ad.png" alt="" />
        <div class="info">
          <p class="name">
            <span>优赛明 维生素E乳</span>
            <span>x1</span>
          </p>
          <p class="size">
            <van-tag>处方药</van-tag>
            <span>80ml</span>
          </p>
          <p class="price">￥25.00</p>
        </div>
        <div class="desc">用法用量：口服，每次1袋，每天3次，用药3天</div>
      </div>
    </div> -->
    <!-- 药品订单列表组件 -->
    <!-- 传入处方的药品信息，供子组件OrderMedical.vue内使用 -->
    <order-medical :medicines="order.medicines"></order-medical>

    <div class="order-detail">
      <van-cell-group>
        <van-cell title="药品金额" :value="`￥${order.payment}`" />
        <van-cell title="运费" :value="`￥${order.expressFee}`" />
        <van-cell title="优惠券" :value="`-￥${order.couponDeduction}`" />
        <van-cell title="实付款" :value="`￥${order.actualPayment}`" class="price" />
        <van-cell title="订单编号" :value="`￥${order.orderNo}`" />
        <van-cell title="创建时间" :value="order.createTime" />
        <van-cell title="支付时间" :value="order.payTime" />
        <van-cell title="支付方式" :value="order.paymentMethod === 1 ? '支付宝支付' : '微信支付'" />
      </van-cell-group>
    </div>
    <!-- 已取消 -->
    <!-- <van-action-bar>
      <van-action-bar-icon icon="delete-o" text="删除" />
      <van-action-bar-button type="primary" text="沟通记录" />
    </van-action-bar> -->
    <!-- 待收货 -->
    <van-action-bar>
      <van-action-bar-button type="primary" text="确认收货" />
    </van-action-bar>
    <!-- 待发货 -->
    <!-- <van-action-bar>
      <van-action-bar-button type="primary" text="提醒发货" />
    </van-action-bar> -->
    <!-- 待支付 -->
    <!-- <van-action-bar>
      <p class="price">需要支付：<span>￥60</span></p>
      <van-action-bar-button color="#bbb" text="取消问诊" />
      <van-action-bar-button type="primary" text="继续支付" />
    </van-action-bar> -->
    <!-- 已完成 -->
    <!-- <van-action-bar>
      <van-action-bar-icon icon="delete-o" text="删除" />
      <van-action-bar-button type="primary" text="再次购买" />
    </van-action-bar> -->
  </div>
</template>

<style lang="scss" scoped>
.order-detail-page {
  padding-top: 46px;
  padding-bottom: 65px;
}
.order-head {
  position: relative;
  padding: 15px;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 80px;
    background: linear-gradient(180deg, rgba(44, 181, 165, 0), rgba(44, 181, 165, 0.2));
    border-bottom-left-radius: 150px 20px;
    border-bottom-right-radius: 150px 20px;
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
    .logistics {
      flex: 1;
      p {
        &:first-child {
          color: var(--cp-primary);
        }
        &:last-child {
          color: var(--cp-tag);
          font-size: 13px;
          margin-top: 5px;
        }
      }
    }
    .van-icon {
      color: var(--cp-tip);
    }
  }
}
:deep(.van-cell) {
  .van-cell__title {
    font-size: 16px;
    flex: none;
    width: 100px;
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
/* .order-medical {
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
} */
.van-action-bar {
  padding: 0 10px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  .price {
    padding: 0 10px;
    > span {
      font-size: 18px;
      color: var(--cp-price);
    }
  }
}
</style>
