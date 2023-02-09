<!-- 个人中心 页面 -->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/services/user'
import type { UserInfo } from '@/types/user'
import { useUserStore } from '@/stores'
import { showConfirmDialog } from 'vant'
import { useRouter } from 'vue-router'

// 定义个人用户信息的响应式数据
const user = ref<UserInfo>()
// 组件挂载完毕
onMounted(async () => {
  // 调用获取个人用户信息接口，获取个人用户信息
  const res = await getUserInfo()
  // 更新个人用户信息数据
  user.value = res.data
})

// 快捷工具的数据
const tools = [
  { label: '我的问诊', path: '/user/consult' },
  { label: '我的处方', path: '/' },
  { label: '家庭档案', path: '/user/patient' },
  { label: '地址管理', path: '/user/address' },
  { label: '我的评价', path: '/' },
  { label: '官方客服', path: '/' },
  { label: '设置', path: '/' }
]

const store = useUserStore()
const router = useRouter()
const logout = () => {
  // Vant 4 组件 Dialog 弹出框
  showConfirmDialog({
    title: '温馨提示',
    message: '您是否确认退出优医问诊'
  })
    .then(() => {
      // on confirm
      // 清除用户信息
      store.delUser()
      // 跳转到登录页
      router.push('/login')
    })
    .catch(() => {
      // on cancel
    })
}
</script>

<template>
  <!-- 由于user可能为undefined，user?.头像用户名手机号等都要加?。为了方便起见，在类名为user-page的div标签上添加v-if属性，属性值为user，如果user为undefined，标签的所有内容将不会渲染 -->
  <div class="user-page" v-if="user">
    <!-- 用户 -->
    <div class="user-page-head">
      <div class="top">
        <van-image round fit="cover" :src="user.avatar" />
        <div class="name">
          <p>{{ user.account }}</p>
          <p><van-icon name="edit" /></p>
        </div>
      </div>
      <van-row>
        <van-col span="6">
          <p>{{ user.collectionNumber }}</p>
          <p>收藏</p>
        </van-col>
        <van-col span="6">
          <p>{{ user.likeNumber }}</p>
          <p>关注</p>
        </van-col>
        <van-col span="6">
          <p>{{ user.score }}</p>
          <p>积分</p>
        </van-col>
        <van-col span="6">
          <p>{{ user.couponNumber }}</p>
          <p>优惠券</p>
        </van-col>
      </van-row>
    </div>

    <!-- 药品订单 -->
    <div class="user-page-order">
      <div class="head">
        <h3>药品订单</h3>
        <router-link to="/order">全部订单 <van-icon name="arrow" /></router-link>
      </div>
      <van-row>
        <van-col span="6">
          <!-- 如果待付款为0，则不显示徽标0，使用逻辑或||。如果user.orderInfo.paidNumber待付款为0，表示false，则运算符号右边的''，因为''表示true，直接输出'' -->
          <van-badge :content="user.orderInfo.paidNumber || ''">
            <cp-icon name="user-paid" />
          </van-badge>
          <p>待付款</p>
        </van-col>
        <van-col span="6">
          <van-badge :content="user.orderInfo.shippedNumber || ''">
            <cp-icon name="user-shipped" />
          </van-badge>
          <p>待发货</p>
        </van-col>
        <van-col span="6">
          <van-badge :content="user.orderInfo.recieveNumber || ''">
            <cp-icon name="user-received" />
          </van-badge>
          <p>待收货</p>
        </van-col>
        <van-col span="6">
          <van-badge :content="user.orderInfo.finishedNumber || ''">
            <cp-icon name="user-finished" />
          </van-badge>
          <p>已完成</p>
        </van-col>
      </van-row>
    </div>

    <!-- 快捷工具 -->
    <div class="user-page-group">
      <h3>快捷工具</h3>
      <!-- Vant 4 组件 Cell 单元格 -->
      <!-- title属性 左侧标题；is-link属性 是否展示右侧箭头并开启点击反馈；border属性 是否显示内边框 -->
      <!-- v-for 遍历数据tools item表示数组tools的每一项，i为索引 -->
      <van-cell
        v-for="(item, i) in tools"
        :key="i"
        :title="item.label"
        :to="item.path"
        is-link
        :border="false"
      >
        <!-- 使用icon插槽自定义左侧图标 -->
        <template #icon><cp-icon :name="`user-tool-0${i + 1}`" /></template>
      </van-cell>
    </div>

    <!-- 退出登录 -->
    <a href="javascript:;" class="logout" @click="logout">退出登录</a>
  </div>
</template>

<style lang="scss" scoped>
.user-page {
  background-color: var(--cp-bg);
  min-height: calc(100vh - 50px);
  padding: 0 15px 65px;
  // 头部
  &-head {
    height: 200px;
    background: linear-gradient(180deg, rgba(44, 181, 165, 0.46), rgba(44, 181, 165, 0));
    margin: 0 -15px;
    padding: 0 15px;
    .top {
      display: flex;
      padding-top: 50px;
      align-items: center;
      .van-image {
        width: 70px;
        height: 70px;
      }
      .name {
        padding-left: 10px;
        p {
          &:first-child {
            font-size: 18px;
            font-weight: 500;
          }
          &:last-child {
            margin-top: 10px;
            color: var(--cp-primary);
            font-size: 16px;
          }
        }
      }
    }
    .van-row {
      margin: 0 -15px;
      padding-top: 15px;
      p {
        text-align: center;
        &:first-child {
          font-size: 18px;
          font-weight: 500;
        }
        &:last-child {
          color: var(--cp-dark);
          font-size: 12px;
          padding-top: 4px;
        }
      }
    }
  }
  // 订单
  &-order {
    background-color: #fff;
    border-radius: 8px;
    margin-bottom: 15px;
    padding-bottom: 15px;
    .head {
      display: flex;
      justify-content: space-between;
      line-height: 50px;
      padding: 0 15px;
      a {
        color: var(--cp-tip);
      }
    }
    .van-col {
      text-align: center;
      .cp-icon {
        font-size: 28px;
      }
      p {
        font-size: 12px;
        padding-top: 4px;
      }
    }
  }
  // 分组
  &-group {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    h3 {
      padding-left: 16px;
      line-height: 44px;
    }
    .van-cell {
      align-items: center;
    }
    .cp-icon {
      font-size: 17px;
      margin-right: 10px;
    }
  }
  .logout {
    display: block;
    margin: 20px auto;
    width: 100px;
    text-align: center;
    color: var(--cp-price);
  }
}
</style>
