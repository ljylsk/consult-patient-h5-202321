<!-- 医生问诊室消息卡片组件 -->

<script setup lang="ts">
import { defineProps } from 'vue'
import type { Message, Prescription } from '@/types/room'
import { MsgType, PrescriptionStatus } from '@/enums'
import type { Image } from '@/types/consult'
import { showImagePreview, showToast } from 'vant'
import { useUserStore } from '@/stores'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import EvaluateCard from '@/views/Room/components/EvaluateCard.vue'
import { useShowPrescription } from '@/composable'
// 导入获取患病时间的文字的方法和获取是否就诊过的文字的方法
import { getConsultFlagText, getIllnessTimeText } from '@/utils/filter'

// props中定义属性list用来接收父组件RoomMessage.vue传过来的值list(所有聊天记录，包括病情描述、温馨提示、通知、默认聊天记录、发送、接收、处方消息等)
defineProps<{ list: Message[] }>()

// 调用useUserStore()函数，创建 store 实例
const store = useUserStore()

// 获取患病时间的文字的方法和获取是否就诊过的文字的方法在问诊详情页面组件中也会使用，所以将两个方法封装起来复用，详见@/utils/filter.ts
/* 
// 获取患病时间的文字
const getIllnessTimeText = (time?: IllnessTime) => {
  // 患者病情ConsultRecord可能为undefined(只有MsgType接收消息类型为21-CardPat患者病情时，才有值)，所以患者病情ConsultRecord中的illnessTime也可能为undefined，所以形参time后面加操作符?，否则调用该函数时，会提示报错：类型"IllnssTime | undefined"的参数不能赋给类型"IllnessTime"的参数
  // 找到llnessTimeOptions数组中的每个对象的value值等于time的对象中的label属性值
  return illnessTimeOptions.find((item) => item.value === time)?.label // illnessTimeOptions.find((item) => item.value === time) 找到llnessTimeOptions数组中的每个对象的value值等于time的对象
  // find() 方法对数组中存在的每个元素执行一次函数：如果找到函数返回 true 值的数组元素，则 find() 返回该数组元素的值（并且不检查剩余值），否则返回 undefined
}
// 获取是否就诊过的文字
const getConsultFlagText = (flag?: 0 | 1) => {
  return illnessFlagOptions.find((item) => item.value === flag)?.label
} 
*/

// 定义图片预览的函数
const onPreviewImage = (event: MouseEvent, pic?: Image[]) => {
  if (pic && pic.length) {
    // Vant 4 组件 ImagePreview 图片预览
    // pic是个数组，数组中的每一项item中有id和url属性，通过map()方法将数组中的所有url组成新数组进行图片预览
    showImagePreview(pic.map((item) => item.url)) // map() 方法使用为每个数组元素调用函数的结果创建新数组
  }
}

// 定义格式化时间的函数
const formatTime = (time: string) => dayjs(time).format('HH:mm') // HH是24小时制，hh是12小时制

// 定义图片加载完毕时触发的事件的回调函数
const loadSuccess = (event: Event, notScroll?: boolean) => {
  // 判断图片是否在初始化时获取聊天记录，如果是，直接返回，不滚动到最底部；如果不在初始化聊天记录而是第二次、第三次...获取聊天记录则需要将聊天记录滚动到最底部
  if (notScroll === true) return
  // 因为发送与接收消息中的图片加载出来显示的是图片的顶端，显示不全
  // 滚动到最底部
  window.scrollTo(0, document.body.scrollHeight) // scrollTo() 方法可把内容滚动到指定的坐标。scrollHeight 属性是一个只读属性，它返回该元素的像素高度，高度包含内边距（padding），不包含外边距（margin）、边框（border），是一个整数，单位是像素 px
}

// 问诊记录页面也会用到查看处方逻辑，所以查看处方的逻辑代码封装成组件
// 查看处方
/* 
// 定义 原始处方 点击事件的回调函数
const showPrescription = async (id?: string) => {
  if (id) {
    // 调用药品订单-根据处方ID查询处方单接口获取处方图片
    const res = await getPrescriptionPic(id)
    // Vant 4 组件 ImagePreview 图片预览
    showImagePreview([res.data.url])
  }
} 
*/
// 调用useShowPrescription()函数，从函数返回值中解构出showPrescription函数，因为返回值不一定只有showPrescription函数，可能有多个函数或变量
// 相当于在此处定义函数showPrescription，然后点击原始处方时调用showPrescription函数
const { showPrescription } = useShowPrescription()

// 购买药品
const router = useRouter()
const buy = (pre?: Prescription) => {
  // 如果有处方信息
  if (pre) {
    // 处方状态为已失效
    if (pre.status === PrescriptionStatus.Invalid) return showToast('处方已失效')
    // 处方状态为未购买且无订单id，跳转到药品订单支付页，地址详见路由规则
    if (!pre.orderId && pre.status === PrescriptionStatus.NotPayment)
      return router.push(`/order/pay?id=${pre.id}`) // 也可写成 router.push('/order/pay?id=' + pre.id)。其中pre.id为处方id
    // 处方状态为未购买且有订单id，跳转到药品订单详情页，地址详见路由规则
    router.push(`/order/${pre.orderId}`)
  }
}
</script>

<template>
  <!-- v-for循环需要一个标签包裹。这个template标签可以生成真实的标签，如果换成div标签来包裹，会多了一个标签 -->
  <!-- <template v-for="item in list" :key="item.id"> -->
  <!-- 将遍历的每一项item解构为{ id, msgType, msg, from, createTime, fromAvatar } -->
  <template v-for="{ id, msgType, msg, from, createTime, fromAvatar, notScroll } in list" :key="id">
    <!-- 【病情描述】 -->
    <!-- 当消息类型为MsgType中的CardPat患者病情时显示此条消息 -->
    <div class="msg msg-illness" v-if="msgType === MsgType.CardPat">
      <div class="patient van-hairline--bottom">
        <!-- 姓名 性别 年龄 -->
        <p>
          {{ msg.consultRecord?.patientInfo.name }} {{ msg.consultRecord?.patientInfo.genderValue }}
          {{ msg.consultRecord?.patientInfo.age }}
        </p>
        <!-- 患病时间 是否就诊过 -->
        <!-- msg.consultRecord?.illnessTime和msg.consultRecord?.consultFlag得到的都是个数字，需要处理成文字 -->
        <p>
          {{ getIllnessTimeText(msg.consultRecord?.illnessTime) }} |
          {{ getConsultFlagText(msg.consultRecord?.consultFlag) }}
        </p>
      </div>
      <van-row>
        <van-col span="6">病情描述</van-col>
        <van-col span="18">{{ msg.consultRecord?.illnessDesc }}</van-col>
        <van-col span="6">图片</van-col>
        <!-- Vant 4 组件 Layout 布局 -->
        <!-- click事件	点击时触发。默认的回调参数(实参)是event【如果用不到默认的回调参数，只用到了自定义参数，默认的回调参数也不能省略不写】，TS类型是MouseEvent。可以自定义参数(实参)，自定义参数(实参)写在默认的回调参数后面，定义click事件的回调函数onPreviewImage时，所有的形参需明确TS类型，实参和形参需一一对应。如果默认的回调参数只有一个，click事件的回调函数中的第一个回调参数可以写成$event，后面再加上自定义参数；如果默认的回调参数不只一个，click事件的回调函数中的回调参数需要按真实的写，后面再加上自定义参数  -->
        <van-col span="18" @click="(event) => onPreviewImage(event, msg.consultRecord?.pictures)"
          >点击查看</van-col
        >
      </van-row>
    </div>

    <!-- 【温馨提示 - 通知】 -->
    <!-- 当消息类型为MsgType中的NotifyTip温馨提示时显示此条消息 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.NotifyTip">
      <div class="content">
        <span class="green">温馨提示：</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>

    <!-- 【通知】 -->
    <!-- 当消息类型为MsgType中的Notify普通通知时显示此条消息 -->
    <!-- 包括时间 list数组中的第一个元素对象就是关于时间的，在属性msg的content属性中 详见@/views/Room/index.vue中关于后台返回的历史消息记录的处理 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.Notify">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>

    <!-- 【发送文字】 -->
    <!-- 发送文字和接收文字是一样的结构，只有图片和文字的前后位置不同。所以通过id进行区分 -->
    <!-- 消息类型为MsgType中的MsgText文字且发送人id等于用户id时显示此内容 -->
    <div class="msg msg-to" v-if="msgType === MsgType.MsgText && from === store.user?.id">
      <div class="content">
        <!-- createTime格式为 年-月-日 时:分:秒   用dayjs插件格式化成想要的时间格式 -->
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
      <!-- 用户头像 -->
      <van-image :src="store.user?.avatar" />
    </div>

    <!-- 【发送图片】 -->
    <!-- 消息类型为MsgType中的MsgImage图片且发送人id等于用户id时显示此内容 -->
    <div class="msg msg-to" v-if="msgType === MsgType.MsgImage && from === store.user?.id">
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <!-- 发送的图片 -->
        <!-- Vant 4 组件 Image 图片 -->
        <!-- load事件	图片加载完毕时触发。默认的回调参数(实参)是event【如果用不到默认的回调参数，只用到了自定义参数，默认的回调参数也不能省略不写】，TS类型是Event。可以自定义参数(实参)，自定义参数(实参)写在默认的回调参数后面，定义load事件的回调函数loadSuccess时，所有的形参需明确TS类型，实参和形参需一一对应。如果默认的回调参数只有一个，load事件的回调函数中的第一个回调参数可以写成$event，后面再加上自定义参数；如果默认的回调参数不只一个，load事件的回调函数中的回调参数需要按真实的写，后面再加上自定义参数  -->
        <!-- 自定义实参notScroll 表示是否是初始化时获取聊天记录，当notScroll为true时，表示initialMsg === false，不是初始化获取聊天记录，不需要将聊天记录滚动到最底部，详见@/views/Room/index.vue -->
        <van-image
          fit="contain"
          :src="msg.picture?.url"
          @load="(event) => loadSuccess(event, notScroll)"
        />
      </div>
      <!-- 用户头像 -->
      <van-image :src="store.user?.avatar" />
    </div>

    <!-- 【接收文字】 -->
    <!-- 消息类型为MsgType中的MsgText文字且发送人id不等于用户id时显示此内容 -->
    <div class="msg msg-from" v-if="msgType === MsgType.MsgText && from !== store.user?.id">
      <!-- 医生头像 -->
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
    </div>

    <!-- 【接收图片】 -->
    <!-- 消息类型为MsgType中的MsgImage图片且发送人id不等于用户id时显示此内容 -->
    <div class="msg msg-from" v-if="msgType === MsgType.MsgImage && from !== store.user?.id">
      <!-- 医生头像 -->
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <!-- 接收的图片 -->
        <van-image
          fit="contain"
          :src="msg.picture?.url"
          @load="(event) => loadSuccess(event, notScroll)"
        />
      </div>
    </div>

    <!-- 【处方消息】 -->
    <!-- 消息类型为MsgType中的CardPre处方信息时显示此内容 -->
    <div class="msg msg-recipe" v-if="msgType === MsgType.CardPre">
      <div class="content">
        <div class="head van-hairline--bottom">
          <div class="head-tit">
            <h3>电子处方</h3>
            <p @click="showPrescription(msg.prescription?.id)">
              原始处方 <van-icon name="arrow"></van-icon>
            </p>
          </div>
          <!-- 姓名、性别、年龄、诊断信息 -->
          <p>
            {{ msg.prescription?.name }} {{ msg.prescription?.genderValue }}
            {{ msg.prescription?.age }}岁 {{ msg.prescription?.diagnosis }}
          </p>
          <p>开方时间：{{ msg.prescription?.createTime }}</p>
        </div>
        <div class="body">
          <div class="body-item" v-for="med in msg.prescription?.medicines" :key="med.id">
            <div class="durg">
              <!-- 药品名称、规格、用量 -->
              <p>{{ med.name }} {{ med.specs }}</p>
              <p>{{ med.usageDosag }}</p>
            </div>
            <!-- 药品数量 -->
            <div class="num">x{{ med.quantity }}</div>
          </div>
        </div>
        <div class="foot"><span @click="buy(msg.prescription)">购买药品</span></div>
      </div>
    </div>

    <!-- 【订单取消】 -->
    <!-- <div class="msg msg-tip msg-tip-cancel">
      <div class="content">
        <span>订单取消</span>
      </div>
    </div> -->

    <!-- 评价 -->
    <!-- 消息类型为MsgType中的CardEva已提交评价或CardEvaForm未提交评价时显示此组件 -->
    <div
      class="msg msg-comment"
      v-if="msgType === MsgType.CardEva || msgType === MsgType.CardEvaForm"
    >
      <!-- 评价医生组件 -->
      <!-- 将list消息中的评价医生的信息evaluateDoc传给组件，如果患者未评价，评价医生的信息可能为空 -->
      <evaluate-card :evaluate="msg.evaluateDoc"></evaluate-card>
    </div>
  </template>
</template>

<style lang="scss" scoped>
@import '@/styles/room.scss';
</style>
