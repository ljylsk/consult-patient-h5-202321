<!-- 把 svg 标签使用图标封装起来 -->

<script setup lang="ts">
// 提供一个props属性 name，确定使用哪个svg图标，使用规则：目录名-图标名
defineProps<{
  name: string
}>()
</script>

<template>
  <svg aria-hidden="true" class="cp-icon">
    <!-- icon-[dir]-[name] 其中：dir表示svg图标在icons文件夹下的目录；name表示svg图标名称 -->
    <!-- <use href="#icon-[dir]-[name]" /> -->
    <use :href="`#icon-${name}`" />
  </svg>
</template>

<style lang="scss" scoped>
.cp-icon {
  // 通过 font-size 控制字体图标大小
  // 通过 width 和 height 控制图片大小 svg文件不是字体图标是图片
  width: 1em; // em 相对单位 相当于父元素的font-size
  height: 1em;
}
</style>
