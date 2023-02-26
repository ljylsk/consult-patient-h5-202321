<!-- 首页的医生卡片 组件 -->

<script lang="ts" setup>
// 按需导入TS类型
import type { Doctor } from '@/types/consult'
import { useFollow } from '@/composable'

// 使用item属性接收父组件FollowDoctor传过来的值item
defineProps<{
  item: Doctor
}>()

/* 
// 关注 - 点击 + 关注 / 已关注 按钮的逻辑
const show = ref(false)
const follow = async (item: Doctor) => {
  // 开启加载
  show.value = true
  try {
    // 调用关注操作接口
    await followTarget('doc', item.id)
    // 后端和前端数据取反 如1已关注 => 0未关注   0未关注 => 1已关注
    item.likeFlag = item.likeFlag === 1 ? 0 : 1
  } finally {
    // 无论异步操作成功还是失败 都会进入finally函数
    // 关闭加载
    show.value = false
  }
} 
*/
// 逻辑复用：以上代码在文章的关注按钮是一样的逻辑，封装起来再使用
const { loading, follow } = useFollow('doc')
</script>
<template>
  <div class="doctor-card">
    <!-- Vant 4 组件 Image 图片 -->
    <van-image round :src="item.avatar" />
    <p class="name">{{ item.name }}</p>
    <p class="van-ellipsis">{{ item.hospitalName }} {{ item.depName }}</p>
    <p>{{ item.positionalTitles }}</p>
    <!-- Vant 4 组件 Button 按钮 -->
    <!-- loading属性	是否显示为加载状态 -->
    <van-button round size="small" type="primary" @click="follow(item)" :loading="loading">
      {{ item.likeFlag === 1 ? '已关注' : '+ 关注' }}
    </van-button>
  </div>
</template>
<style scoped lang="scss">
.doctor-card {
  width: 135px;
  height: 190px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0px 0px 11px 0px rgba(229, 229, 229, 0.2);
  text-align: center;
  padding: 15px;
  margin-left: 15px;
  display: inline-block;
  box-sizing: border-box;
  > .van-image {
    width: 58px;
    height: 58px;
    vertical-align: top;
    border-radius: 50%;
    margin: 0 auto 8px;
  }
  > p {
    margin-bottom: 0;
    font-size: 11px;
    color: var(--cp-tip);
    &.name {
      font-size: 13px;
      color: var(--cp-text1);
      margin-bottom: 5px;
    }
  }
  > .van-button {
    padding: 0 12px;
    height: 28px;
    margin-top: 8px;
    width: 72px;
  }
}
</style>
