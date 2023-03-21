<script setup lang="ts">
import { ref } from 'vue'
// 按需导入各表单项校验规则
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { showSuccessToast, showToast } from 'vant'
// 按需导入密码登录接口、发送验证码接口、短信验证码登录接口
import { loginByPassword, loginByCode } from '@/services/user'
// 按需导入用户状态仓库
import { useUserStore } from '@/stores'
import { useRouter, useRoute } from 'vue-router'
import { useMobileCode } from '@/composable'
import axios from 'axios'

// 定义控制复选框勾选状态的响应式数据
const agree = ref(false)
// 定义控制密码是否可见的响应式数据
const show = ref(false)
// 定义表单项手机号和密码的响应式数据
const mobile = ref('')
const password = ref('')
// 用户的pinia状态
const store = useUserStore()
// 路由实例
const router = useRouter()
// 当前路由地址
const route = useRoute()

// 定义表单的submit事件处理函数login
// 同时支持 密码登录 和 短信验证码登录
const login = async () => {
  // 未勾选用户协议轻提示
  if (!agree.value) return showToast('请勾选用户协议') // 注意：获取响应式数据的值在js中要写.value。一定要return，否则后面的代码依旧会执行
  // 勾选用户协议后调用密码登录接口或短信验证码登录接口
  const res = isPass.value
    ? await loginByPassword(mobile.value, password.value)
    : await loginByCode(mobile.value, code.value)
  // 存储用户状态
  store.setUser(res.data) // 注意：setUser()函数的参数已经声明了TS类型，所以res.data也要声明TS类型，即声明密码登录接口loginByPassword返回值的TS类型
  // 跳转到当前登录页的来源页面 - 接口失效页面
  // router方法replace：通过替换历史堆栈中的当前 entry，以编程方式导航到一个新的 URL
  // router方法push：通过在历史堆栈中推送一个 entry，以编程方式导航到一个新的 URL
  // 区别：replace方法不会将当前登录页推送到历史堆栈中；push方法会将当前登录页推送到历史堆栈中。当从登录页跳转到个人中心或其他页面上时，进行回退操作无需返回到登录页，所以使用replace方法，不会将当前登录页推送到历史堆栈中
  router.replace((route.query.returnUrl as string) || '/user') // 当前登录页是否有来源页面，即登录页的路由地址中是否存在query参数，returnUrl详见响应拦截器。如果有，跳转到来源页，如果没有，跳转到个人中心/user
  showSuccessToast('登录成功')
}

// 短信登录界面切换，添加短信输入框校验
const isPass = ref(true)
// 定义表单项验证码的响应式数据
const code = ref('')

// 发送短信验证码
// 发送验证码的相关逻辑在也会授权QQ登录后手机未绑定时跳转的页面@/views/Login/LoginCallback.vue也会用到，所以封装起来复用，详见@/composable/index.ts
/* 
// 1. API接口调用函数
// 2. 发送短信验证码：判断是否正在倒计时 校验手机号 调用短信验证码接口
// 3. 调用接口成功，倒计时，组件销毁要清理定时器
// 定义倒计时时间的响应式数据，默认为0
const time = ref(0)
// 定义定时器个数的变量
let timeId: number
// 通过 ref 可以获取到 Form 实例
const form = ref<FormInstance | null>(null)
const send = async () => {
  // 正在倒计时，time大于0，此时不能发送验证码，直接返回
  if (time.value > 0) return

  // 校验手机号
  // 通过 ref 可以获取到 Form 实例并调用实例方法validate来校验name属性值为mobile的手机号输入框。调用validate方法的返回值是Promise
  await form.value?.validate('mobile') // form.value.之后没有提示表单实例的各种方法，是因为没有给Form实例添加TS类型。Ctrl+鼠标左键点击van-form标签来查看Form实例的TS类型 => FormInstance

  // 手机号校验成功后调用发送验证码接口
  await sendMobileCode(mobile.value, 'login') // 当输入''时会自动出现参数type的所有可选项

  // 开启倒计时
  time.value = 60
  clearInterval(timeId)
  timeId = setInterval(() => {
    time.value--
    if (time.value <= 0) clearInterval(timeId)
  }, 1000)
}
// 组件实例被卸载之后调用onUnmounted函数
onUnmounted(() => {
  // 清除定时器
  clearInterval(timeId)
}) 
*/
// 调用useMobileCode逻辑函数，获取form实例、send方法和time响应式数据
const { form, send, time } = useMobileCode(mobile, 'bindMobile')

/* 
// 放置QQ登录按钮
// 组件挂载完成后执行该回调函数~
onMounted(() => {
  // 调用login()接口设置QQ登录按钮要放置的位置
  QC.Login({
    btnId: 'qq' //插入QQ登录按钮的节点id
  })
}) 
*/
// 以上放置QQ登录按钮的逻辑是为了拿到点击QQ登录按钮时跳转的链接(https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=http%3A%2F%2Fconsult-patients.itheima.net%2Flogin%2Fcallback)【点击登录按钮后，在谷歌开发者工具的元素面板中查看id为qq的div标签下的a标签的onclick属性值中有跳转的链接】，复制该链接后删除上述放置QQ登录按钮的逻辑代码，改成自己的图片外的 a 标签的 href 跳转即可，不要QQ登录按钮。开发中是在电脑上测试的，使用QQ登录无法与手机上的QQ关联，所以把谷歌手机模拟器关闭，换成PC模拟器，使用手机QQ扫码进行登录，走通接下来的流程
// 对 https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=http%3A%2F%2Fconsult-patients.itheima.net%2Flogin%2Fcallback 中的 http%3A%2F%2Fconsult-patients.itheima.net%2Flogin%2Fcallback 进行开发环境和生产环境的区分，并转码。注：/login/callback 为申请接入QQ登录时输入的回调地址即用户授权QQ登录后跳转的地址
const url = encodeURIComponent(import.meta.env.VITE_APP_CALLBACK + '/login/callback') // encodeURIComponent() 函数可把字符串作为 URI 组件进行编码

// 测试mock接口
axios.get('/patient/message/list').then((res) => console.log('mock生成的随机数据', res))
// 为何用axios而不是request发请求？如果用request发请求前面有完整的域名 baseURL(https://consult-api.itheima.net/)，直接走那个服务器，不会走通过 npm run dev 启动的本地服务器，拿不到模拟数据
</script>

<template>
  <div class="login-page">
    <!-- Vant 4 组件 NavBar 导航栏 -->
    <cp-nav-bar right-text="注册" @click-right="$router.push('/register')"></cp-nav-bar>

    <!-- 头部 -->
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
      <a href="javascript:;" @click="isPass = !isPass">
        <span>{{ isPass ? '短信验证码登录' : '密码登录' }}</span>
        <!-- Vant 4 组件 Icon 图标 -->
        <van-icon name="arrow"></van-icon>
      </a>
    </div>

    <!-- 表单 -->
    <!-- Vant 4 组件 Form 表单 -->
    <!-- submit事件	提交表单且验证通过后触发 -->
    <!-- validate方法 验证表单，支持传入一个或多个 name 来验证单个或部分表单项 -->
    <van-form ref="form" @submit="login">
      <!-- Vant 4 组件 Field 输入框 => 通过 v-model 双向绑定输入框的值；placeholder 设置占位提示文字；type 属性定义不同类型的输入框，默认值为 text；autocomplete属性 自动补全 即输入框输入过程中会有提示；name属性	名称，作为提交表单时的标识符 -->
      <van-field
        name="mobile"
        v-model="mobile"
        type="tel"
        placeholder="请输入手机号"
        :rules="mobileRules"
        autocomplete="off"
      ></van-field>
      <van-field
        v-if="isPass"
        v-model="password"
        :type="show ? 'text' : 'password'"
        placeholder="请输入密码"
        :rules="passwordRules"
      >
        <!-- 通过 right-icon 插槽可以在输入框尾部插入图标 -->
        <template #right-icon>
          <!-- 封装的全局通用组件CpIcon 通过动态属性name给组件CpIcon传值 -->
          <cp-icon @click="show = !show" :name="`login-eye-${show ? 'on' : 'off'}`"></cp-icon>
        </template>
      </van-field>
      <van-field
        v-else
        v-model="code"
        type="text"
        placeholder="请输入验证码"
        :rules="codeRules"
        autocomplete="off"
      >
        <template #button>
          <span class="btn-send" @click="send" :class="{ active: time > 0 }">{{
            time > 0 ? `${time}s后再次发送` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <!-- Vant 4 组件 Checkbox 复选框 -->
        <van-checkbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <!-- Vant 4 组件 Button 按钮 -->
        <!-- native-type属性：设置原生 button 标签的 type 属性 -->
        <van-button native-type="submit" type="primary" round block>登录</van-button>
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>

    <!-- 底部 -->
    <div class="login-other">
      <!-- Vant 4 组件 Divider 分割线 -->
      <van-divider>第三方登录</van-divider>
      <div class="icon">
        <!-- 点击图片，存储当前路由地址的回跳地址returnUrl到用户状态，并跳转至QQ快捷登录页面 -->
        <!-- <a
          href="https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=http%3A%2F%2Fconsult-patients.itheima.net%2Flogin%2Fcallback"
          @click="store.updateReturnUrl($route.query.returnUrl as string)"
        > -->
        <a
          :href="`https://graph.qq.com/oauth2.0/authorize?client_id=102015968&response_type=token&scope=all&redirect_uri=${url}`"
          @click="store.updateReturnUrl($route.query.returnUrl as string)"
        >
          <img src="@/assets/qq.svg" alt="" />
        </a>
      </div>
      <!-- QQ登录按钮的html元素节点，并给该节点指定全页面唯一的id -->
      <!-- <div id="qq"></div> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/login.scss';
</style>
