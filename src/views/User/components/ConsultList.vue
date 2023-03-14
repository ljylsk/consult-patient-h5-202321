<!-- 问诊记录列表组件 -->

<script setup lang="ts">
import type { ConsultType } from '@/enums'
import ConsultItem from './ConsultItem.vue'
import { ref } from 'vue'
import type { ConsultOrderItem, ConsultOrderListParams } from '@/types/consult'
import { getConsultOrderList } from '@/services/consult'
// 1. 准备好查询参数
// 2. 实现加载更多效果
// 3. 触发加载更多操作时，发请求获取数据
// 4. 拿到数据后，结束加载状态
// 4.1 有数据，追加列表
// 4.2 无数据，置为完成
// 5. 渲染
// 使用props属性type接收父组件ConsultPage.vue传过来的type属性值
const props = defineProps<{
  type: ConsultType
}>()
const params = ref<ConsultOrderListParams>({
  current: 1,
  pageSize: 5,
  type: props.type
})
// 定义列表加载状态的变量，默认为false不加载
const loading = ref(false)
// 定义数据全部加载完毕的响应式数据，默认未全部加载完毕
const finished = ref(false)
// 定义问诊记录的订单列表的响应式数据
const list = ref<ConsultOrderItem[]>([])
// 定义加载数据的函数
const onLoad = async () => {
  // 调用接口获取问诊记录的订单列表
  const res = await getConsultOrderList(params.value)
  // 将加载的每条数据追加到list数组中
  list.value.push(...res.data.rows)
  // 如果当前页码小于订单列表的总页数
  if (params.value.current < res.data.pageTotal) {
    // 将当前页加1，继续加载数据
    params.value.current++
  } else {
    // 数据全部加载完毕
    finished.value = true
  }
  // 数据更新完毕，关闭加载状态
  loading.value = false
}

// 父组件(当前组件)中定义子组件ConsultItem.vue自定义事件onDelete的回调函数，其中id为形参。子组件ConsultItem.vue中通过 emit 触发事件onDelete时，传递了数据即实参(item.id)
const onDeleteOrder = (id: String) => {
  // 问诊记录的订单列表list数组中去掉删除的问诊订单那条数据
  list.value = list.value.filter((item) => item.id !== id) // filter() 方法返回一个新的、由通过测试的元素组成的数组，如果没有任何数组元素通过测试，则返回空数组。
}
</script>

<template>
  <div class="consult-list">
    <!-- Vant 4 组件 List 列表 -->
    <!-- List 组件通过 loading 和 finished 两个变量控制加载状态，当组件滚动到底部时，会触发 load 事件并将 loading 设置成 true。此时可以发起异步操作并更新数据，数据更新完毕后，将 loading 设置成 false 即可。若数据已全部加载完毕，则直接将 finished 设置成 true 即可。 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <!-- 遍历问诊记录的订单列表list数组，并将每条问诊记录传给consultItem.vue组件 -->
      <!-- 组件通讯-子传父：父组件(当前组件)通过自定义事件的方式给子组件consultItem.vue注册事件 -->
      <consult-item v-for="item in list" :key="item.id" :item="item" @onDelete="onDeleteOrder" />
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.consult-list {
  padding: 10px 15px;
}
</style>
