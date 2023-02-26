<!-- 问诊 -->

<script setup lang="ts">
import RoomStatus from '@/views/Room/components/RoomStatus.vue'
import RoomAction from '@/views/Room/components/RoomAction.vue'
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室"></cp-nav-bar>
    <room-status></room-status>
    <room-action></room-action>
  </div>
</template>

<style lang="scss" scoped></style>
