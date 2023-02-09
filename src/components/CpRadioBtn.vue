<!-- 单选按钮 -->

<script setup lang="ts">
// 定义属性及TS类型，接收父组件传过来的值
defineProps<{
  // 所有单选按钮的内容
  options: {
    label: string // 单选按钮上面的文字内容
    value: number | string // 单选按钮文字内容对应的代号
  }[]
  // 选中的单选按钮对应的value值 如 1对应的是男 0对应的是女
  modelValue?: number | string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', value: number | string): void }>()
</script>

<template>
  <div class="cp-radio-btn">
    <a
      class="item"
      href="javascript:;"
      v-for="item in options"
      :key="item.value"
      :class="{ active: modelValue === item.value }"
      @click="emit('update:modelValue', item.value)"
      >{{ item.label }}</a
    >
  </div>
</template>

<style lang="scss" scoped>
.cp-radio-btn {
  display: flex;
  // 换行
  flex-wrap: wrap;
  .item {
    height: 32px;
    min-width: 60px;
    line-height: 30px;
    padding: 0 14px;
    text-align: center;
    border: 1px solid var(--cp-bg);
    background-color: var(--cp-bg);
    margin-right: 10px;
    box-sizing: border-box;
    color: var(--cp-text2);
    margin-bottom: 10px;
    border-radius: 4px;
    transition: all 0.3s;
    &.active {
      border-color: var(--cp-primary);
      background-color: var(--cp-plain);
    }
  }
}
</style>
