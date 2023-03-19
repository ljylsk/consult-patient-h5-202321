<!-- QQ登录授权后手机未绑定时跳转的页面 -->

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { loginByQQ } from '@/services/user'
import { mobileRules, codeRules } from '@/utils/rules'
import { showSuccessToast } from 'vant'
import { bindMobile } from '@/services/user'
import { useUserStore } from '@/stores'
import type { User } from '@/types/user'
import { useRouter } from 'vue-router'
import { useMobileCode } from '@/composable'

// 1 登录
// 1.1 通过QQ的JS SDK的JavaScript文件提供的API获取你登录后的openId(即登录后标识)
// 1.2 如果后台数据库中存储了 openId + 你的账号手机号，去登录就可以成功，否则失败
// 2. 绑定手机号
// 2.1 记录两个数据：openId isBind(是否需要绑定)
// 定义用户身份的唯一标识openId的响应式数据
const openId = ref('')
// 定义是否需要绑定手机的响应式数据
const isBind = ref(false)
onMounted(() => {
  // 检查(用户)是否已经(授权QQ)登录
  if (window.QC.Login.check()) {
    // env.d.ts文件中提供QC相关的TS类型
    // getMe方法只能在用户登录授权后调用，建议总是在使用check方法并返回true的条件下，调用getMe方法
    window.QC.Login.getMe((id) => {
      openId.value = id
      // openId：用户身份的唯一标识。建议保存在本地，以便用户下次登录时可对应到其之前的身份信息，不需要重新授权。详见https://wiki.connect.qq.com/js_sdk%e4%bd%bf%e7%94%a8%e8%af%b4%e6%98%8e中2. JS SDK的其他公开方法
      // 调用QQ登录接口
      loginByQQ(id)
        .then((res) => {
          // 登录成功
          loginSuccess(res.data)
        })
        .catch((e) => {
          // 登录失败
          console.log(e)
          // 需要绑定手机
          isBind.value = true
        })
    })
  }
})

// 定义手机号的响应式数据
const mobile = ref('')
// 定义验证码的响应式数据
const code = ref('')

// 发送短信验证码
// 发送验证码的相关逻辑在登录页面@/views/Login/inex.vue也会用到，所以封装起来复用，详见@/composable/index.ts
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

  // 手机号校验成功后调用获取手机验证码接口
  await sendMobileCode(mobile.value, 'bindMobile') // 当输入''时会自动出现参数type的所有可选项

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

// 绑定手机号
// 成功：
// 1. 存储用户信息
// 2. 在登录页点击QQ登录时需要记录来源页，根据回跳地址进行跳转，如果没有默认回跳至个人中心页面
// 3. 删除记录的来源页数据
// 4. 提示登录成功
// 获取用户状态仓库
const store = useUserStore()
// 获取当前路由实例
const router = useRouter()
// 定义登录成功后的函数
const loginSuccess = (u: User) => {
  store.setUser(u)
  // 跳转至回跳地址或个人中心页面(无回跳地址时)，replace() 方法导航后不会留下历史记录
  router.replace(store.returnUrl || '/user')
  // 清空回跳地址
  store.updateReturnUrl('')
  // Toast 轻提示
  showSuccessToast('登录成功')
}
// 定义提交表单的回调函数
const bind = async () => {
  const res = await bindMobile({ mobile: mobile.value, code: code.value, openId: openId.value })
  loginSuccess(res.data)
}
</script>

<template>
  <div class="login-page" v-if="isBind">
    <cp-nav-bar></cp-nav-bar>
    <div class="login-head">
      <h3>手机绑定</h3>
    </div>
    <!-- submit事件	提交表单，与点击提交按钮的效果等价 -->
    <van-form autocomplete="off" ref="form" @submit="bind">
      <van-field
        v-model="mobile"
        name="mobile"
        placeholder="请输入手机号"
        :rules="mobileRules"
      ></van-field>
      <van-field v-model="code" name="code" placeholder="请输入验证码" :rules="codeRules">
        <template #button>
          <span class="btn-send" @click="send">{{
            time > 0 ? `${time}s后再次发送` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <!-- Vant 4 组件 Button 按钮 -->
        <!-- native-type属性	原生 button 标签的 type 属性 -->
        <van-button block round type="primary" native-type="submit"> 立即绑定 </van-button>
      </div>
    </van-form>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/login.scss';
</style>
