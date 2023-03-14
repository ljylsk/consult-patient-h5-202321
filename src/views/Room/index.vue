<!-- 医生问诊室 -->

<script setup lang="ts">
import RoomStatus from '@/views/Room/components/RoomStatus.vue'
import RoomAction from '@/views/Room/components/RoomAction.vue'
import RoomMessage from '@/views/Room/components/RoomMessage.vue'
import { onMounted, onUnmounted, ref, nextTick, provide } from 'vue'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { baseURL } from '@/utils/request'
// 导入用户状态仓库
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import type { TimeMessages, Message } from '@/types/room'
import { MsgType, OrderState } from '@/enums'
import type { ConsultOrderItem, Image } from '@/types/consult'
import { getConsultOrderDetail } from '@/services/consult'
import { showToast } from 'vant'
import dayjs from 'dayjs'

// 调用useConsultStore()，创建store实例
const store = useUserStore()
// 调用useRoute()，创建route实例
const route = useRoute()
// 1. 建立连接
// 安装 socekt.io-client 包
// 组件挂载完毕，建立socket连接；组件卸载，关闭连接
// let socket // 提示：变量"socket"在某些无法确定其类型的位置处隐式具有类型"any"
let socket: Socket // Socket是sicket.io-client中的一个TS类型
// 定义历史聊天记录的响应式数据 所有消息包括病情描述、温馨提示、通知、默认聊天记录、发送、接收、处方消息等
const list = ref<Message[]>([])
// 组件实例被卸载之后调用
onUnmounted(() => {
  // 关闭连接
  socket.close()
})
// 组件挂载完成后执行~
onMounted(() => {
  // 建立连接，创建socket.io实例
  // const socket = io(baseURL, { // 如果在onMounted()函数定义变量socket就不能在onUnMounted()函数中使用。正确做法在全局作用域中定义变量socket，在各个函数中使用(如赋值、调用方法等)
  socket = io(baseURL, {
    // baseURL为服务器基础地址
    // 身份认证
    auth: {
      token: `Bearer ${store.user?.token}`
    },
    // 订单id
    query: {
      // 地址栏获取orderId，在建立连接时发送给socket服务器
      orderId: route.query.orderId
    }
  })

  // 建立连接成功   connect事件 固定写法
  socket.on('connect', () => {
    // 断开连接后再次连接socket，需要清空聊天记录，避免有重复的聊天记录
    list.value = []
  })

  // 错误异常消息
  socket.on('error', (err) => {
    console.log(err)
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log('disconnect')
  })

  // 查询历史聊天记录
  // 1. 绑定消息记录事件，后台链接成功主动发消息
  // 2. 拿到消息分组后，处理成可以用的消息列表 Message[]
  // 3. 定义响应式数据，接收数据，依据数据渲染即可
  socket.on('chatMsgList', async ({ data }: { data: TimeMessages[] }) => {
    // 解构历史聊天记录 res 为 { data }
    /* 
  // socket.on('chatMsgList', (res) => {
    console.log(res)
    // 控制台输出结果为
    {code: 10000, message: '请求成功', data: Array(1)}
      code: 10000
      data: Array(1)
        0:
          createTime: "2023-03-02 09:25:29"
          items: Array(3)
            0:
              createTime: "2023-03-02 09:25:29"
              from: "sys"
              fromAvatar: "https://img1.baidu.com/it/u=1383854933,2412543187&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"
              id: "6871942467833857"
              msg:
                consultRecord: {id: '6871942467293184', type: 2, orderNo: '220230302092528929148', pictures: Array(1), createTime: '2023-03-02 09:25:29', …}
                [[Prototype]]: Object
              msgType: 21
              orderId: "6871942467293184"
              status: 0
              to: "148"
              toAvatar: "https://dss0.bdstatic.com/-0U0bXSm1A5BphGlnYG/tam-ogel/3dc528d31e8db3fc5150b8c80a5a02ab_128_176.jpg"
              [[Prototype]]: Object
            1: {id: '6871942467932161', from: 'sys', to: '148', toAvatar: 'https://dss0.bdstatic.com/-0U0bXSm1A5BphGlnYG/tam-ogel/3dc528d31e8db3fc5150b8c80a5a02ab_128_176.jpg', fromAvatar: 'https://img0.baidu.com/it/u=4110407549,4163227769&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500', …}
            2: {id: '6871942468005889', from: 'sys', to: '148', toAvatar: 'https://dss0.bdstatic.com/-0U0bXSm1A5BphGlnYG/tam-ogel/3dc528d31e8db3fc5150b8c80a5a02ab_128_176.jpg', fromAvatar: 'https://img1.baidu.com/it/u=1383854933,2412543187&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500', …}
            length: 3
            [[Prototype]]: Array(0)
          orderId: "6871942467293184"
          sid: null
          [[Prototype]]: Object
          length: 1
        [[Prototype]]: Array(0)
      message: "请求成功"
      [[Prototype]]: Object 
      */
    // 处理消息：分组的时间自己组织成一条通用消息，items从data中取出来放后面，最终形成一条完整的历史聊天记录
    // 定义一条历史聊天记录的变量arr为空数组
    const arr: Message[] = []
    // 遍历后台返回的历史消息，处理成我们需要的格式
    data.forEach((item, i) => {
      // 记录消息分组中的第一组的时间，作为下次获取聊天记录的时间 因为聊天-查询历史聊天记录接口中其中一个请求参数是lastTime最后一次时间
      if (i === 0) time.value = item.createTime
      // ① 将一条历史聊天记录的时间推送到数组中
      arr.push({
        // id、msgType、createTime、msg见@/type/room.d.ts中的Message的属性
        id: item.createTime,
        msgType: MsgType.Notify,
        createTime: item.createTime,
        msg: {
          // 历史聊天记录的时间文本
          content: item.createTime
        }
      })
      // ② 将一条历史聊天记录的内容推送到数组中
      // arr.push(...item.items)
      // ② 将一条历史聊天记录的内容推送到数组中，且在每一条历史聊天记录中添加一个是否滚动的字段notScroll，当initialMsg === false时不滚动，即除了初始化时获取历史聊天记录需要将聊天记录滚动到最底部，其他次都不需要滚动到最底部
      item.items.forEach((item) => {
        arr.push({ ...item, notScroll: initialMsg.value === false })
      })
    })
    // arr.unshift()用于将一个或多个元素添加到给定数组的开头
    list.value.unshift(...arr) // 因为历史聊天记录是从下向上翻看的

    // 关闭下拉刷新的加载中效果
    loading.value = false
    // 如果后台没有聊天记录数据，轻提示
    if (!data.length) showToast('没有更多聊天记录了')

    // 初始化获取的聊天记录需要滚动到最底部
    // 因为历史聊天记录list数组中添加消息后需要渲染DOM，是个异步操作，所以调用nextTick函数
    // nextTick调用结果返回Promise。等异步操作执行完(历史聊天记录的DOM渲染完)再执行下面的代码
    nextTick(() => {
      // 如果是初始化时获取聊天记录
      if (initialMsg.value) {
        // 消息设置为已读 详见socket.io通讯规则和聊天-修改信息为已读接口，请求参数为最新的消息id
        socket.emit('', arr[arr.length - 1].id)
        // 滚动到最底部
        window.scrollTo(0, document.body.scrollHeight) // scrollTo() 方法可把内容滚动到指定的坐标。scrollHeight 属性是一个只读属性，它返回该元素的像素高度，高度包含内边距（padding），不包含外边距（margin）、边框（border），是一个整数，单位是像素 px
        // 将默认(第一次获取)的聊天记录改为不是第一次获取聊天记录 true -> false
        initialMsg.value = false
      }
    })
    /* // 也可以用await/async修饰nextTick()函数，如下：
    await nextTick()
    if (initialMsg.value) {
      window.scrollTo(0, document.body.scrollHeight)
      initialMsg.value = false
    } 
    */
  })

  // 等链接成功后，注册事件-订单状态变化
  socket.on('statusChange', async () => {
    // 调用问诊-查询订单详情信息接口，获取订单状态变化后的订单详情信息
    const res = await getConsultOrderDetail(route.query.orderId as string)
    consult.value = res.data
  })

  // 接收消息
  socket.on('receiveChatMsg', async (msg) => {
    // 当底部文本输入框输入鹅鹅鹅鹅鹅鹅进行发送时，打印后台返回的数据msg，发现和TS类型Message一样，所以给msg
    // console.log(msg)
    /* 控制台输出结果为
    {from: '198', fromAvatar: 'https://dss0.bdstatic.com/-0U0bXSm1A5BphGlnYG/tam-ogel/3dc528d31e8db3fc5150b8c80a5a02ab_128_226.jpg', to: '1', toAvatar: 'https://yjy-teach-oss.oss-cn-beijing.aliyuncs.com/consult/deafaultAvatar.jpg', createTime: '2023-03-06 03:15:26', …}
      createTime: "2023-03-06 03:15:26"
      from: "198"
      fromAvatar: "https://dss0.bdstatic.com/-0U0bXSm1A5BphGlnYG/tam-ogel/3dc528d31e8db3fc5150b8c80a5a02ab_128_226.jpg"
      id: "6873267102150656"
      msg: {content: '鹅鹅鹅鹅鹅鹅'}
      msgType: 1
      orderId: "6873263374217216"
      status: 0
      to: "1"
      toAvatar: "https://yjy-teach-oss.oss-cn-beijing.aliyuncs.com/consult/deafaultAvatar.jpg"
      [[Prototype]]: Object 
    */
    // 将socket服务器返回的消息推送到list数组中
    list.value.push(msg)
    // 推送的最新的接收消息要渲染成DOM是异步操作
    await nextTick() // nextTick调用结果返回Promise，用await/async修饰。等异步操作执行完(接收消息的DOM渲染完)再执行下面的代码
    // 滚动到最底部
    window.scrollTo(0, document.body.scrollHeight) // scrollTo() 方法可把内容滚动到指定的坐标。scrollHeight 属性是一个只读属性，它返回该元素的像素高度，高度包含内边距（padding），不包含外边距（margin）、边框（border），是一个整数，单位是像素 px

    // 消息设置为已读 详见socket.io通讯规则和聊天-修改信息为已读接口，请求参数为最新的消息id
    socket.emit('UpdateMsgStatus', msg.id)
  })
})

// 接诊状态的控制
// 1. 组件挂载后，需要知道当前的订单状态：待接诊、问诊中、问诊完成等
// 2. 订单状态改变后，需要知道已经变化，更新当前接诊状态
// 3. 依赖状态：
//    3.1 顶部状态组件 需要条件渲染，有倒计时
//    3.1 底部操作组件 需要禁用和启用
// 定义订单详情信息的响应式数据
const consult = ref<ConsultOrderItem>()
// 组件挂载完成后执行~
onMounted(async () => {
  // 调用问诊-查询订单详情信息接口，获取订单状态等信息
  const res = await getConsultOrderDetail(route.query.orderId as string)
  consult.value = res.data
})

// 发送文字信息
// 1. 底部操作栏组件RoomAction.vue，输入信息后需要传递给父组件即当前组件
// 2. 由父组件来发送信息，通过socket.emit的sendChatMsg事件发送文字给服务器
// 3. 通过 socket.on 的 receiveChatMsg 接收发送成功或者医生发来的消息
// 4. 展示消息
// 定义父组件监听子组件RoomAction.vue的sendText事件的回调函数sendTexts。因为子组件为sendText事件传递了文字数据，所以父组件监听子组件sendText事件的回调函数sendTexts可以拿到这个文字数据，通过形参text接收
const sendTexts = (text: string) => {
  // 通过socket.emit的sendChatMsg事件发送文字给socket服务器
  socket.emit('sendChatMsg', {
    // 给医生发送文字消息需要以下数据，详见聊天-发送对话信息接口
    from: store.user?.id, // 发送人id
    to: consult.value?.docInfo.id, // 接收人id
    msgType: MsgType.MsgText, // 消息类型 为文字
    msg: {
      content: text // 文字信息
    }
  })
}

// 发送图片信息
// 1. 底部操作栏组件RoomAction.vue，上传图片后触发sendImage事件传出图片给父组件即当前组件
// 2. 由父组件监听sendImage事件接收图片
// 3. 通过socket.emit的sendChatMsg事件发送图片给服务器
// 4. 展示图片消息
// 定义父组件监听子组件RoomAction.vue的sendImage事件的回调函数sendImages。因为子组件为sendImage事件传递了图片数据，所以父组件监听子组件sendImage事件的回调函数sendImages可以拿到这个图片数据，通过形参img接收
const sendImages = (img: Image) => {
  // 通过socket.emit的sendChatMsg事件发送图片给socket服务器
  socket.emit('sendChatMsg', {
    // 给医生发送图片消息需要以下数据，详见聊天-发送对话信息接口
    from: store.user?.id, // 发送人id
    to: consult.value?.docInfo.id, // 接收人id
    msgType: MsgType.MsgImage, // 消息类型 为图片
    msg: {
      picture: img // 图片信息
    }
  })
}

// 加载更多聊天记录
// 1. 初始化获取的聊天记录滚动到最底部，第二次，第三次，...获取的聊天记录不需要滚动到最底部
// 2. 实现下拉刷新效果
// 3. 下拉刷新后，发送一个获取聊天记录的消息给后台
// 4. 触发聊天记录事件，记录当前时间段最早的时间，作为发送聊天记录消息的参数给后台
// 4.1 判断如果有数据，追加到数组，如果没有数据，轻提示没有数据
// 5. 断开连接后再次连接socket服务器，需要清空聊天记录，避免有重复的聊天记录
// 定义是否是初始化获取的聊天记录的响应式数据
const initialMsg = ref(true)
// 定义是否处于加载中状态的响应式数据
const loading = ref(false)
// 定义聊天-查询历史聊天记录接口中的其中一个请求参数最后一次时间的响应式数据，为当前时间并指定时间格式 H大写表示24小时制 h小写表示12小时制
const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
// 定义下拉刷新时触发的函数
const onRefresh = () => {
  // 通过socket.emit的getChatMsgList事件获取聊天记录 参数详见聊天-查询历史聊天记录接口：条数、最后一次时间和orderId
  socket.emit('getChatMsgList', 20, time.value, route.query.orderId)
}

// 评价
// 1. 把 未评价 和 已评价 的卡片封装在一个组件
// 2. 渲染组件时，把消息list中的评价信息传入组件
// 3. 根据是否有评价信息，展示对应的卡片
// 3.1 有数据，展示
// 3.2 无数据，绑定表单数据，收集表单数据，提交评价
// 3.3 评价成功，修改评价信息状态和数据，切换卡片展示
// provide和inject是解决跨级组件通讯的方案：provide 提供后代组件需要依赖的数据或函数；inject 注入（获取）provide提供的数据或函数
// 将 consult 变量(中的 ① docId 评价医生的id ② orderId 订单id)传给后代组件EvaluateCard.vue
provide('consult', consult)
// 定义患者评价医生后显示评价消息并展示评价分数的函数
const completeEva = (score: number) => {
  // 在聊天记录list数组中找到消息类型为23未提交评价的那组数据
  const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm)
  // 如果item存在
  if (item) {
    // 将未评价改为已评价。在EvaluateCard.vue组件中将显示评价后的消息而不是需要评价的表单
    item.msgType = MsgType.CardEva
    // 将已评价的分数赋值给评价医生信息evaluateDoc，如果患者未评价，evaluateDoc可能为空，所以不能 item.msg.evaluateDoc?.score = score 这样写，会有错误提示
    item.msg.evaluateDoc = { score }
  }
}
// 将 completeEva 函数传给后代组件EvaluateCard.vue
provide('completeEva', completeEva)
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="医生问诊室"></cp-nav-bar>
    <!-- 顶部订单状态 -->
    <room-status :status="consult?.status" :countdown="consult?.countdown"></room-status>
    <!-- 消息 -->
    <!-- Vant 4 组件 PullRefresh 下拉刷新 -->
    <!-- 下拉刷新时会触发 refresh 事件，在事件的回调函数中可以进行同步或异步操作，操作完成后将 v-model 设置为 false，表示加载完成 -->
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message :list="list"></room-message>
    </van-pull-refresh>
    <!-- 底部订单操作栏 -->
    <!-- 当订单状态不是问诊中时禁用 -->
    <!-- 父组件中为子组件注册自定义事件sendText，事件的回调函数为sendTexts -->
    <!-- 父组件中为子组件注册自定义事件sendImage，事件的回调函数为sendImages -->
    <!-- 从 Vant 4 开始，所有的事件均采用 Vue 官方推荐的驼峰格式进行命名 -->
    <room-action
      :disabled="consult?.status !== OrderState.ConsultChat"
      @sendText="sendTexts"
      @sendImage="sendImages"
    ></room-action>
  </div>
</template>

<style lang="scss" scoped>
.room-page {
  padding-top: 90px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);
  .van-pull-refresh {
    width: 100%;
    // calc()函数用于动态计算长度值，calc()运算符前后都需要保留一格空格，任何长度值都可以使用calc()函数进行计算，calc()函数支持"+"，"-"，"*"，"/"
    min-height: calc(100vh - 150px);
  }
}
</style>
