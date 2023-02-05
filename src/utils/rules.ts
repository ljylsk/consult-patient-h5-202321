// 定义表单校验规则

// 引入 Vant 4 中Field组件的rules属性的校验规则的TS类型 FieldRule【将鼠标置于van-field标签的rules动态属性上，提示rules的TS类型为FieldRule[]】
import type { FieldRule } from 'vant'

// Vant 4 组件 Form 表单 => Rule 数据结构
// 手机号
const mobileRules: FieldRule[] = [
  {
    required: true,
    message: '手机号不能为空'
  },
  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
]
// 密码
const passwordRules: FieldRule[] = [
  {
    required: true,
    message: '密码不能为空'
  },
  { pattern: /^\w{8,24}$/, message: '密码为8-24字符' }
]
// 短信验证码
const codeRules = [
  { required: true, message: '验证码不能为空' },
  { pattern: /^\d{6}$/, message: '验证码为6位数字' }
]

// 按需导出
export { mobileRules, passwordRules, codeRules }
