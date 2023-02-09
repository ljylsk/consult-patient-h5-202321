<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
// 按需导入各表单项校验规则
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { showSuccessToast, showToast, type FormInstance } from 'vant'
// 按需导入密码登录接口、发送验证码接口、短信验证码登录接口
import { loginByPassword, sendMobileCode, loginByCode } from '@/services/user'
// 按需导入用户状态仓库
import { useUserStore } from '@/stores'
import { useRouter, useRoute } from 'vue-router'

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
// 1. API接口调用函数
// 2. 发送短信验证码：判断是否正在倒计时 校验手机号 调用短信验证码接口
// 3. 接口成功，倒计时，组件销毁要清理定时器
// 定义倒计时事件为0
const time = ref(0)
// 定义定时器个数
let timeId: number
// 通过 ref 可以获取到 Form 实例
const form = ref<FormInstance | null>(null)
const send = async () => {
  // 正在倒计时，timed大于0，此时不能发送验证码，直接返回
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
        <img src="@/assets/qq.svg" alt="" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  &-page {
    padding-top: 46px;
  }
  &-head {
    display: flex;
    padding: 30px 30px 50px;
    justify-content: space-between;
    align-items: flex-end;
    line-height: 1;
    h3 {
      font-weight: normal;
      font-size: 24px;
    }
    a {
      font-size: 15px;
    }
  }
  &-other {
    margin-top: 60px;
    padding: 0 30px;
    .icon {
      display: flex;
      justify-content: center;
      img {
        width: 36px;
        height: 36px;
        padding: 4px;
      }
    }
  }
}

.van-form {
  padding: 0 14px;
  .cp-cell {
    height: 52px;
    line-height: 24px;
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    .van-checkbox {
      a {
        color: var(--cp-primary);
        padding: 0 5px;
      }
    }
  }
  .btn-send {
    color: var(--cp-primary);
    &.active {
      color: rgba(22, 194, 163, 0.5);
    }
  }
}
</style>
