<!-- 评价医生组件 -->

<script setup lang="ts">
import type { ConsultOrderItem } from '@/types/consult'
import type { EvaluateDoc } from '@/types/room'
import { showToast } from 'vant'
import { ref, computed, inject, type Ref } from 'vue'
import { evaluateConsultOrder } from '@/services/consult'
defineProps<{
  evaluate?: EvaluateDoc
}>()

// 收集评价医生需要提交的数据(详见问诊-订单-评价医生接口)：① docId 评价医生的id，② orderId 订单id，③ score 分数，④ content 评价内容，⑤ anonymousFlag 匿名标志
// 其中① docId 评价医生的id，② orderId 订单id，来自于父级的父级组件@/views/Room/index.vue
// provide和inject是解决跨级组件通讯的方案：provide 提供后代组件需要依赖的数据或函数；inject 注入（获取）provide提供的数据或函数
// 引入父级的父级组件@/views/Room/index.vue中的变量consult，并加上泛型。因为变量consult中有评价医生需要的① docId 评价医生的id，② orderId 订单id
const consult = inject<Ref<ConsultOrderItem>>('consult')
// 引入父级的父级组件@/views/Room/index.vue中的函数completeEva，显示评价消息并展示评价分数
const completeEva = inject<(score: number) => void>('completeEva')
const score = ref(0)
const content = ref('')
const anonymousFlag = ref(false)
// 没有分数或评价内容时，计算属性disabled为false
const disabled = computed(() => !score.value || !content.value)
const onSubmit = async () => {
  if (!score.value) return showToast('请评分')
  if (!content.value) return showToast('请评价')
  if (!consult?.value) return showToast('问诊订单不存在') // consult 可能为 undefined
  if (consult?.value.docInfo.id) {
    // 调用评价医生接口，提交评价
    await evaluateConsultOrder({
      docId: consult?.value.docInfo.id,
      orderId: consult?.value.id,
      score: score.value,
      content: content.value,
      anonymousFlag: anonymousFlag.value ? 1 : 0 // 如果anonymousFlag为true，则等于1，false为0
    })
    // 患者评价医生后显示评价消息并展示评价分数
    completeEva && completeEva(score.value)
  }
}
</script>

<template>
  <!-- 患者已评价，显示评价医生的信息 -->
  <div class="evalutate-card" v-if="evaluate">
    <p class="title">医生服务评价</p>
    <p class="desc">我们会更加努力提升服务质量</p>
    <!-- Vant 4 组件 Rate 评分 -->
    <!-- size属性	图标大小，默认单位为px -->
    <!-- gutter属性	图标间距，默认单位为px -->
    <!-- color属性	选中时的颜色 -->
    <!-- void-icon属性	未选中时的图标名称或图片链接，等同于 Icon 组件的 name 属性 -->
    <!-- void-color属性	未选中时的颜色 -->
    <van-rate
      :modelValue="evaluate.score"
      size="7vw"
      gutter="3vw"
      color="#FADB14"
      void-icon="star"
      void-color="rgba(0,0,0,0.04)"
    />
  </div>

  <!-- 患者未评价，显示评价表单 -->
  <div class="evalutate-card" v-else>
    <p class="title">感谢您的评价</p>
    <p class="desc">本次在线问诊服务您还满意吗？</p>
    <van-rate
      v-model="score"
      size="7vw"
      gutter="3vw"
      color="#FADB14"
      void-icon="star"
      void-color="rgba(0,0,0,0.04)"
    />
    <van-field
      v-model="content"
      type="textarea"
      maxlength="150"
      show-word-limit
      rows="3"
      placeholder="请描述您对医生的评价或是在医生看诊过程中遇到的问题"
    ></van-field>
    <div class="footer">
      <van-checkbox v-model="anonymousFlag">匿名评价</van-checkbox>
      <van-button :class="{ disabled }" type="primary" size="small" round @click="onSubmit">
        提交评价
      </van-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.evalutate-card {
  width: 100%;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  padding: 15px;
  .title {
    font-size: 15px;
    margin-bottom: 5px;
  }
  .desc {
    font-size: 12px;
    margin-bottom: 15px;
    color: var(--cp-tip);
  }
  .van-field {
    background-color: var(--cp-bg);
    margin: 15px 0;
    border-radius: 8px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    ::v-deep() {
      .van-checkbox {
        .van-icon {
          font-size: 12px;
        }
        &__label {
          font-size: 12px;
          color: var(--cp-tip);
        }
        height: 16px;
      }
      .van-button {
        padding: 0 16px;
        &.disabled {
          opacity: 1;
          background: #fafafa;
          color: #d9dbde;
          border: #fafafa;
        }
      }
    }
  }
}
</style>
