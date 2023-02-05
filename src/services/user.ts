// 用户相关的接口请求函数
import type { CodeType, User } from '@/types/user'
import { request } from '@/utils/request'
// 密码登录接口
export const loginByPassword = (mobile: string, password: string) =>
  request<User>('login/password', 'post', { mobile, password })

// 发送验证码接口
export const sendMobileCode = (mobile: string, type: CodeType) =>
  request('code', 'get', { mobile, type })

// 短信验证码登录接口
export const loginByCode = (mobile: string, code: string) =>
  request<User>('login', 'post', { mobile, code })
