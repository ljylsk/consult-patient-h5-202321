<!-- “更多” 的逻辑组件 -->

<script setup lang="ts">
import { ref, computed } from 'vue'

// 用props属性disabled接收父组件传过来的布尔值，控制 查看处方 是否禁用
const props = defineProps<{
  disabled?: boolean // TS类型小写
}>()
// 子组件(当前组件)通过 defineEmits获取 emit 函数
const emit = defineEmits<{
  // 子组件(当前组件)要触发父组件的事件名
  (e: 'onDelete'): void // 删除问诊订单
  (e: 'onPreview'): void // 处方图片预览
}>()

// 定义是否展示 更多 按钮的气泡弹出层的响应式数据
const showPopover = ref(false)
// 通过 actions 属性来定义 更多 按钮的气泡弹出框菜单选项
// 这样写不会随时根据item数据的变化而变化
// const actions = [{ text: '查看处方', disabled: !props.item.prescriptionId }, { text: '删除订单' }]
// 定义 更多 按钮的气泡弹出框的菜单选项为响应式数据 计算属性
const actions = computed(() => [
  // 没有处方id时，查看处方 禁用
  // { text: '查看处方', disabled: !props.item.prescriptionId },
  // 使用该组件的父组件传过来的disabled的属性值，控制 查看处方 是否禁用
  { text: '查看处方', disabled: props.disabled },
  { text: '删除订单' }
])
// 定义点击 更多 按钮的气泡弹出框选项时触发的事件的回调函数，回调参数 action: PopoverAction, index: number。详见Vant 4 组件 Popover 气泡弹出框
const onSelect = (action: { text: string }, i: number) => {
  // 如果索引为1即actions数组中第2个元素，更多 按钮的气泡弹出框中的菜单选项-删除订单
  if (i === 1) {
    // 调用 删除订单 按钮的点击事件的事件处理函数执行删除逻辑
    // deleteConsultOrder(props.item)
    // 子组件(当前组件)通过 emit 触发事件
    emit('onDelete')
  }
  // 如果索引为0即actions数组中第1个元素，更多 按钮的气泡弹出框中的菜单选项-查看处方
  if (i === 0) {
    // 调用showPrescription函数，处方图片预览
    // showPrescription(props.item.prescriptionId)
    // 子组件(当前组件)通过 emit 触发事件
    emit('onPreview')
  }
}
</script>

<template>
  <div class="cp-consult-more">
    <!-- Vant 4 组件 Popover 气泡弹出框 -->
    <!-- v-model:show属性	是否展示气泡弹出层 -->
    <!-- actions属性	选项列表 -->
    <!-- select事件	点击选项时触发。回调参数 action: PopoverAction, index: number -->
    <!-- placement属性	弹出位置 -->
    <van-popover
      v-model:show="showPopover"
      :actions="actions"
      @select="onSelect"
      placement="top-start"
    >
      <template #reference>更多</template>
    </van-popover>
  </div>
</template>

<style lang="scss" scoped>
.cp-consult-more {
  color: var(--cp-tag);
  flex: 1;
  font-size: 13px;
}
</style>
