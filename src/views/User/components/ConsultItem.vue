<!-- 每条问诊记录组件 -->

<script setup lang="ts">
import { OrderState } from '@/enums'
import type { ConsultOrderItem } from '@/types/consult'
import { useRouter } from 'vue-router'
import { useShowPrescription, useOrderCancel, useDeleteOrder } from '@/composable'

// 使用props属性item接收父组件ConsultList.vue传过来的值【组件ConsultList.vue中的consult-item标签上的type属性值，即每条问诊记录】
/* const props = defineProps<{
  item: ConsultOrderItem
}>() */
const props = defineProps<{
  item: ConsultOrderItem
}>()

// 1. body区域：点击后去订单详情
// 2. foot区域：根据问诊订单状态展示按钮
//     待支付：取消订单+去支付
//     待接诊：取消订单+继续沟通
//     咨询中：查看处方(如果开了)+继续沟通
//     已完成：更多(查看处方(如果开了)，删除订单)+问诊记录+评价(未评价：写评价；已评价：查看评价)
//     已取消：删除订单+咨询其他医生
const router = useRouter()
/* 
// “更多” 的逻辑代码：
// 定义是否展示 更多 按钮的气泡弹出层的响应式数据
const showPopover = ref(false)
// 通过 actions 属性来定义 更多 按钮的气泡弹出框菜单选项
// 这样写不会随时根据item数据的变化而变化
// const actions = [{ text: '查看处方', disabled: !props.item.prescriptionId }, { text: '删除订单' }]
// 定义 更多 按钮的气泡弹出框的菜单选项为响应式数据 计算属性
const actions = computed(() => [
  // 没有处方id时，查看处方 禁用
  { text: '查看处方', disabled: !props.item.prescriptionId },
  { text: '删除订单' }
])
// 定义点击 更多 按钮的气泡弹出框选项时触发的事件的回调函数，回调参数 action: PopoverAction, index: number。详见Vant 4 组件 Popover 气泡弹出框
const onSelect = (action: { text: string }, i: number) => {
  // 如果索引为1即actions数组中第2个元素，更多 按钮的气泡弹出框中的菜单选项-删除订单
  if (i === 1) {
    // 调用 删除订单 按钮的点击事件的事件处理函数执行删除逻辑
    deleteConsultOrder(props.item)
  }
  // 如果索引为0即actions数组中第1个元素，更多 按钮的气泡弹出框中的菜单选项-查看处方
  if (i === 0) {
    // 调用showPrescription函数，处方图片预览
    showPrescription(props.item.prescriptionId)
  }
}
*/
// 调用useShowPrescription()查看处方的逻辑函数，从函数返回值中解构出showPrescription函数，因为返回值不一定只有showPrescription函数，可能有多个函数或变量
// 相当于在此处定义函数showPrescription，然后点击原始处方时调用showPrescription函数
const { showPrescription } = useShowPrescription()

// 取消订单：
// 取消订单的逻辑在问诊订单详情页面中也会用到，封装起来复用，详见@/composable/index.ts
/* 
// 定义 取消订单 按钮的加载状态的响应式数据。默认为false不加载
const loading = ref(false)
// 定义 取消订单 按钮的点击事件的事件处理函数
const onCancelOrder = async (item: ConsultOrderItem) => {
  // 开启 取消订单 按钮的加载状态
  loading.value = true

  // 调用取消订单接口
  // // es2018以前的语法：
  // try {
  //   await cancelOrder(item.id)
  //   // 取消订单成功
  //   // 修改问诊订单状态
  //   item.status = OrderState.ConsultCancel
  //   item.statusValue = '已取消'
  //   // Vant 4 组件 Toast 轻提示
  //   showToast('取消订单成功')
  // } catch (e) {
  //   // 取消订单失败
  //   // Vant 4 组件 Toast 轻提示
  //   showToast('取消订单失败')
  // } finally {
  //   // 无论取消成功或失败，都会执行
  //   // 关闭 取消订单 按钮的加载状态
  //   loading.value = false
  // }

  // TypeScript 最高支持es2016语法【详见/node_models/@vue/tsconfig/tsconfig.web.json】，但是 finally() 方法是es2018新增。会提示：属性“finally”在类型“Promise<void>”上不存在。是否需要更改目标库? 请尝试将 “lib” 编译器选项更改为“es2018”或更高版本。所以在tsconfig.json中将 “lib” 编译器选项更改为“es2018”或更高版本即可解决

  // 调用取消订单接口
  // es2018的语法：新增finally() 方法
  cancelOrder(item.id)
    .then(() => {
      // 取消订单成功
      // 修改问诊订单状态
      item.status = OrderState.ConsultCancel
      item.statusValue = '已取消'
      // Vant 4 组件 Toast 轻提示
      showSuccessToast('取消订单成功')
    })
    .catch(() => {
      // 取消订单失败
      // Vant 4 组件 Toast 轻提示
      showFailToast('取消订单失败')
    })
    .finally(() => {
      // 无论取消订单成功或失败，都会执行
      // 关闭 取消订单 按钮的加载状态
      loading.value = false
    })
} 
*/
// 调用useOrderCancel()取消订单的逻辑函数，从函数返回值中解构出loading变量和onCancelOrder函数
// 相当于在此处定义函数onCancelOrder和变量loading，然后点击取消订单时调用onCancelOrder函数
const { loading, onCancelOrder } = useOrderCancel()

// 删除订单：
// 1. 加载效果
// 2. 定义API接口
// 3. 删除订单逻辑函数
// 4. 使用逻辑
// 删除订单的逻辑在问诊订单详情页面和每条问诊记录组件中都会用到，封装起来复用。区别是：在问诊订单详情页面上删除订单时，需要页面跳转至问诊记录页面，并且删除该条订单。解决方案是调用删除订单接口成功后，执行不同的逻辑(每条问诊记录的组件调用删除订单接口成功后，通知父组件问诊记录列表页面ConsultList.vue删除订单；而订单详情页面调用删除订单接口成功后跳转至问诊记录页面，并删除该条订单) => 删除订单的逻辑在封装成函数时，传入一个形参函数，在调用删除订单接口成功后调用，在每条问诊记录的组件和订单详情页面分别调用删除订单的逻辑函数时，传入所需的实参函数，实现调用后的功能(每条问诊记录的组件调用删除订单接口成功后，通知父组件问诊记录列表页面ConsultList.vue删除订单；订单详情页面调用删除订单接口成功后跳转至问诊记录页面，并删除该条订单)
/* 
// 定义点击 删除订单 按钮时的加载状态的响应式数据
const loading = ref(false)
// 子组件(当前组件)通过 defineEmits 获取 emit 函数
const emit = defineEmits<{
  // 事件名和传递的数据及函数返回值类型(如果函数没有返回值，返回值类型为void)
  (e: 'onDelete', id: string): void
}>()
// 定义 删除订单 按钮的点击事件的事件处理函数
const deleteConsultOrder = (item: ConsultOrderItem) => {
  // 开启 删除订单 按钮的加载状态
  loading.value = true
  // 调用删除订单接口
  deleteOrder(item.id)
    .then(() => {
      // 删除订单成功：
      // 通知父组件ConsultList.vue删除此条问诊记录
      // 子组件(当前组件)通过 emit 触发事件onDelete，并且传递数据
      emit('onDelete', item.id)
      // Toast 轻提示
      showSuccessToast('删除订单成功')
    })
    .catch(() => {
      // 删除订单失败：
      showFailToast('删除订单失败')
    })
    .finally(() => {
      // 无论删除订单成功或失败都会执行：
      // 关闭 删除订单 按钮的加载状态
      loading.value = false
    })
} 
*/
// 调用删除订单的逻辑函数useDeleteOrder时传入实参(调用删除订单接口成功后的函数)，并从函数返回值中解构出loading变量和deleteConsultOrder函数。
// 相当于在此处定义函数deleteConsultOrder和变量loading，然后点击删除订单时调用deleteConsultOrder函数
// 前面已经有loading变量了，这里将loading重命名为deleteLoading
const emit = defineEmits<{
  (e: 'onDelete', id: string): void
}>()
const { loading: deleteLoading, deleteConsultOrder } = useDeleteOrder(() => {
  emit('onDelete', props.item.id)
})
</script>

<template>
  <div class="consult-item">
    <div class="head van-hairline--bottom">
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p>极速问诊（自动分配医生）</p>
      <!-- 订单状态。订单状态为TS类型待支付ConsultPay = 1时，添加类名orange -->
      <span
        :class="{
          orange: item.status === OrderState.ConsultPay,
          green: item.status === OrderState.ConsultChat
        }"
        >{{ item.statusValue }}</span
      >
    </div>
    <!-- 点击此区域，跳转至问诊详情，路由地址详见路由约定规则 -->
    <!-- router.push(`/user/consult/${item.id}`) 也可以写成 router.push('/user/consult/' + item.id) -->
    <div class="body" @click="router.push(`/user/consult/${item.id}`)">
      <div class="body-row">
        <div class="body-label">病情描述</div>
        <div class="body-value">{{ item.illnessDesc }}</div>
      </div>
      <div class="body-row">
        <div class="body-label">价格</div>
        <div class="body-value">¥ {{ item.payment }}</div>
      </div>
      <div class="body-row">
        <div class="body-label">创建时间</div>
        <div class="body-value tip">{{ item.createTime }}</div>
      </div>
    </div>
    <!-- 如果问诊订单状态是ConsultPay = 1待支付，显示以下按钮 -->
    <div class="foot" v-if="item.status === OrderState.ConsultPay">
      <!-- Vant 4 组件 Button 按钮 -->
      <!-- 通过 loading 属性设置按钮为加载状态，加载状态下默认会隐藏按钮文字，可以通过 loading-text 设置加载状态下的文字 -->
      <!-- 为 取消订单 按钮注册点击事件，事件处理函数为onCancelOrder，并传入实参item -->
      <van-button
        class="gray"
        plain
        size="small"
        round
        @click="onCancelOrder(item)"
        :loading="loading"
        loading-text="加载中..."
        >取消订单</van-button
      >
      <!-- to	点击后跳转的目标路由对象，等同于 vue-router 的 to 属性 -->
      <!-- 点击去支付按钮，跳转至问诊详情页面。:to="'/user/consult/' + item.id" 也可以写成 :to="`/user/consult/${item.id}`" -->
      <van-button type="primary" plain size="small" round :to="'/user/consult/' + item.id"
        >去支付</van-button
      >
    </div>
    <!-- 如果问诊订单状态是ConsultWait = 2待接诊，显示以下按钮 -->
    <div class="foot" v-if="item.status === OrderState.ConsultWait">
      <van-button
        class="gray"
        plain
        size="small"
        round
        @click="onCancelOrder(item)"
        :loading="loading"
        loading-text="加载中..."
        >取消订单</van-button
      >
      <!-- 点击继续沟通按钮，跳转至问诊室页面。:to="'/room?orderId=' + item.id" 也可以写成 :to="`/room?orderId=${item.id}`" -->
      <van-button type="primary" plain size="small" round :to="'/room?orderId=' + item.id"
        >继续沟通</van-button
      >
    </div>
    <!-- 如果问诊订单状态是ConsultChat = 3问诊中，显示以下按钮 -->
    <div class="foot" v-if="item.status === OrderState.ConsultChat">
      <!-- 如果医生开了处方，才显示查看处方按钮 -->
      <!-- 为 查看处方 按钮绑定点击事件，事件的处理函数为showPrescription，并传入实参处方id -->
      <van-button
        class="gray"
        plain
        size="small"
        round
        v-if="item.prescriptionId"
        @click="showPrescription(item.prescriptionId)"
        >查看处方</van-button
      >
      <van-button type="primary" plain size="small" round :to="'/room?orderId=' + item.id"
        >继续沟通</van-button
      >
    </div>
    <!-- 如果问诊订单状态是ConsultComplete = 4问诊完成，显示以下按钮 -->
    <div class="foot" v-if="item.status === OrderState.ConsultComplete">
      <!-- Vant 4 组件 Popover 气泡弹出框。v-model:show属性	是否展示气泡弹出层。actions属性 	选项列表。select事件	点击选项时触发。回调参数 action: PopoverAction, index: number。placement属性 	弹出位置 -->
      <!-- 
      <div class="more">
        <van-popover
          v-model:show="showPopover"
          :actions="actions"
          @select="onSelect"
          placement="top-start"
        >
          <template #reference>更多</template>
        </van-popover>
      </div> 
      -->
      <!-- 更多 的逻辑代码已经封装成组件CpConsultMore.vue -->
      <!-- 组件通讯(子传父)：父组件中为子组件CpConsultMore.vue绑定自定义事件onDelete和onPreview，并提供事件的处理函数deleteConsultOrder和showPrescription -->
      <cp-consult-more
        :disabled="!item.prescriptionId"
        @onDelete="deleteConsultOrder(item)"
        @onPreview="showPrescription(item.prescriptionId)"
      ></cp-consult-more>
      <van-button class="gray" plain size="small" round>问诊记录</van-button>
      <van-button class="gray" plain size="small" round v-if="item.evaluateId">查看评价</van-button>
      <van-button type="primary" plain size="small" round v-else>写评价</van-button>
    </div>
    <!-- 如果问诊订单状态是ConsultCancel = 5取消订单，显示以下按钮 -->
    <!-- Vant 4 组件 Button 按钮 -->
    <!-- 通过 loading 属性设置按钮为加载状态，加载状态下默认会隐藏按钮文字，可以通过 loading-text 设置加载状态下的文字 -->
    <!-- 为 删除订单 按钮注册点击事件，事件处理函数为deleteConsultOrder，并传入实参item -->
    <div class="foot" v-if="item.status === OrderState.ConsultCancel">
      <van-button
        class="gray"
        plain
        size="small"
        round
        :loading="deleteLoading"
        loading-text="加载中..."
        @click="deleteConsultOrder(item)"
        >删除订单</van-button
      >
      <!-- 点击咨询其他医生按钮，跳转至首页 -->
      <van-button type="primary" plain size="small" round :to="'/'">咨询其他医生</van-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.consult-item {
  border-radius: 4px;
  box-shadow: 0px 0px 22px 0px rgba(245, 245, 245, 0.1);
  background-color: #fff;
  margin-bottom: 10px;
  .head {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 15px;
    .img {
      width: 20px;
      height: 20px;
    }
    > p {
      flex: 1;
      font-size: 15px;
      padding-left: 10px;
    }
    > span {
      color: var(--cp-tag);
      &.orange {
        color: #f2994a;
      }
      &.green {
        color: var(--cp-primary);
      }
    }
  }
  .body {
    padding: 15px 15px 8px 15px;
    .body-row {
      display: flex;
      margin-bottom: 7px;
    }
    .body-label {
      width: 62px;
      font-size: 13px;
      color: var(--cp-tip);
    }
    .body-value {
      width: 250px;
      &.tip {
        color: var(--cp-tip);
      }
    }
  }
  .foot {
    padding: 0 15px 15px 15px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .van-button {
      margin-left: 10px;
      padding: 0 16px;
      &.gray {
        color: var(--cp-text3);
        background-color: var(--cp-bg);
      }
    }
    /* 
    .more {
      color: var(--cp-tag);
      flex: 1;
      font-size: 13px;
    } 
    */
  }
}
</style>
