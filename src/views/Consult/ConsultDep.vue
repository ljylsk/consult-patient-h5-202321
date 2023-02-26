<!-- 选择科室页面 -->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
// 导入TS类型
import type { TopDep } from '@/types/consult'
// 导入接口函数
import { getAllDep } from '@/services/consult'
// 导入问诊仓库
import { useConsultStore } from '@/stores'

// 定义当前侧边导航选中项的索引，默认值是0
const active = ref(0)

// 一级科室：
// 定义所有科室的响应式数据
const allDep = ref<TopDep[]>([])
onMounted(async () => {
  const res = await getAllDep()
  allDep.value = res.data
})
// 二级科室：依赖一级科室和当前一级科室的索引得到   注意：组件初始化如果没有数据 child 可能拿不到，所以需要加?
const subDep = computed(() => allDep.value[active.value]?.child)

// 调用useConsultStore()，创建store实例
const store = useConsultStore()
</script>

<template>
  <div class="consult-dep-page">
    <cp-nav-bar title="选择科室"></cp-nav-bar>
    <div class="wrapper">
      <!-- 一级科室： -->
      <!-- Vant 4 组件 Sidebar 侧边导航 -->
      <!-- 通过 v-model 绑定当前选中项的索引，默认值是0 -->
      <van-sidebar v-model="active">
        <van-sidebar-item v-for="item in allDep" :key="item.id" :title="item.name" />
      </van-sidebar>
      <!-- 二级科室： -->
      <div class="sub-dep">
        <!-- 点击二级科室，记录下id，跳转至病情描述(图文问诊)页面 ConsultIllness.vue -->
        <router-link
          to="/consult/illness"
          v-for="item in subDep"
          :key="item.id"
          @click="store.setDep(item.id)"
          >{{ item.name }}</router-link
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.van-sidebar {
  width: 114px;
  &-item {
    padding: 14px;
    color: var(--cp-tag);
    &--select {
      color: var(--cp-main);
      font-weight: normal;
      &::before {
        display: none;
      }
    }
  }
}
.consult-dep-page {
  padding-top: 46px;
}
.wrapper {
  height: calc(100vh - 46px);
  overflow: hidden;
  display: flex;
  .sub-dep {
    flex: 1;
    height: 100%;
    overflow-y: auto;
    > a {
      display: block;
      padding: 14px 30px;
      color: var(--cp-dark);
    }
  }
}
</style>
