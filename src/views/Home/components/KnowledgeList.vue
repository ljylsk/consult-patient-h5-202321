<!-- 首页的文章列表组件 -->

<script setup lang="ts">
// 注意：只有vant组件和src/components/下的组件才不需import~
import KnowledgeCard from './KnowledgeCard.vue'
import { ref } from 'vue'
// 按需导入TS类型
import type { KnowledgeType, KnowledgeList, KnowledgeParams } from '@/types/consult'
// 按需导入接口
import { getKnowledgePage } from '@/services/consult'

// 需要父组件传入type才知道请求什么类型的文章
const props = defineProps<{
  type: KnowledgeType
}>()

const loading = ref(false)
const finished = ref(false)
// 文章列表的响应式数据
const list = ref<KnowledgeList>([])
// 查询文章列表接口的查询参数
const params = ref<KnowledgeParams>({
  type: props.type, // 文章类型
  current: 1, // 当前页码
  pageSize: 5 // 每页条数
})
const onLoad = async () => {
  // 调用查询文章列表接口
  const res = await getKnowledgePage(params.value)
  // 更新文章列表数据
  list.value.push(...res.data.rows)
  // 数据更新完毕后，关闭加载更多
  loading.value = false
  // 判断数据是否加载完毕
  if (params.value?.current >= res.data.pageTotal) {
    // 如果当前页码大于等于总页数 代表已全部加载完毕
    finished.value = true
  } else {
    // 如果当前页码小于总页数 代表数据没未全部加载完毕 继续加载
    params.value.current++
  }
}
</script>

<template>
  <div class="knowledge-list">
    <!-- Vant 4 组件 List 列表 -->
    <!-- List 组件通过 loading 和 finished 两个变量控制加载状态，当组件滚动到底部时，会触发 load 事件并将 loading 设置成 true。此时可以发起异步操作并更新数据，数据更新完毕后，将 loading 设置成 false 即可。若数据已全部加载完毕，则直接将 finished 设置成 true 即可。 -->
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <!-- 遍历文章列表数据list，将list数据中的每一项item传给组件KnowledgeCard -->
      <knowledge-card v-for="item in list" :key="item.id" :item="item"></knowledge-card> </van-list
    >>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-list {
  padding: 0 15px;
}
</style>
