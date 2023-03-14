<!-- 医生问诊室底部订单操作栏组件 -->

<script setup lang="ts">
import { uploadImg } from '@/services/consult'
import type { Image } from '@/types/consult'
import { showLoadingToast } from 'vant'
import type { UploaderAfterRead } from 'vant/lib/uploader/types'
import { ref } from 'vue'
// props属性disabled用来接收父组件@/views/Room/index.vue传过来的值，控制底部操作栏是否禁用
defineProps<{
  disabled: boolean
}>()

// 以下代码是把文本输入框内容提交给父组件@/views/Room/index.vue
// 子组件通过 defineEmits 获取 emit 函数
const emit = defineEmits<{
  // 事件名和数据，可以有多组事件名和数据
  // 从 Vant 4 开始，所有的事件均采用 Vue 官方推荐的驼峰格式进行命名
  (e: 'sendText', text: string): void
  (e: 'sendImage', img: Image): void
}>()
// 定义文本输入框的响应式数据
const text = ref('')
// 定义enter键弹起时的事件keyup.enter的回调函数
const onSendText = () => {
  // 子组件通过emit触发事件，并传递数据
  emit('sendText', text.value)
  // 文字发送后清空文本输入框的内容
  text.value = ''
}

// 以下代码实现图片上传和把对象传递给父组件
// 定义文件读取完成后的回调函数
// 将鼠标放置在Uploader组件的after-read属性上，显示TS类型是UploaderAfterRead | undefined，所以给回调函数onAfterRead加TS类型 UploaderAfterRead
const onAfterRead: UploaderAfterRead = async (item) => {
  if (Array.isArray(item)) return // 要求只允许上传一张图片，如果上传的图片不是一张，直接返回
  if (!item.file) return // 如果没有上传图片，直接返回
  // 上传图片
  // 加载提示
  showLoadingToast('上传中') // 返回的是toast实例
  // 调用上传文件/图片接口获取图片的id和url
  const res = await uploadImg(item.file)
  // 子组件即当前组件触发sendImage事件，并上传图片信息数据
  emit('sendImage', res.data)
}
</script>

<template>
  <div class="room-action">
    <!-- 绑定enter键弹起时的事件，事件的回调函数为onSendText   @keyup.enter="onSendText" -->
    <!-- 从 Vant 4 开始，所有的事件均采用 Vue 官方推荐的驼峰格式进行命名 -->
    <van-field
      type="text"
      class="input"
      :border="false"
      placeholder="问医生"
      autocomplete="off"
      :disabled="disabled"
      v-model="text"
      @keyup.enter="onSendText"
    ></van-field>
    <!-- Vant 4 组件 Uploader 文件上传 -->
    <!-- preview-image属性	是否在上传完成后展示预览图 -->
    <!-- after-read属性 文件读取完成后的回调函数 -->
    <van-uploader :preview-image="false" :disabled="disabled" :after-read="onAfterRead">
      <!-- 使用小图标作为上传按钮 -->
      <cp-icon name="consult-img" />
    </van-uploader>
  </div>
</template>

<style lang="scss" scoped>
.room-action {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 1;
  box-sizing: border-box;
  .input {
    background-color: var(--cp-bg);
    border: none;
    border-radius: 25px;
    margin-right: 10px;
    padding: 8px 15px;
  }
  .cp-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
