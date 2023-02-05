// 用户信息的类型声明 类型别名User遵循大驼峰命名规范
export type User = {
  // token令牌
  token: string
  // 头像
  avatar: string
  // 手机号
  mobile: string
  // 用户名
  account: string
  // 用户id
  id: string
}

// 短信验证码类型
export type CodeType =
  | 'login'
  | 'register'
  | 'changeMobile'
  | 'forgetPassword'
  | 'bindMobile'
