// 用户相关的TS类型声明 类型别名遵循大驼峰命名规范

// 用户信息的TS类型声明
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

// 短信验证码的TS类型声明
export type CodeType = 'login' | 'register' | 'changeMobile' | 'forgetPassword' | 'bindMobile'

// 从用户信息中删除某些属性 type 新类型别名 = Omit<类型别名, '属性名'>
// PS：从某类型中摘取某些属性 type 新类型别名 = Pick<类型别名, '属性名'>
type OmitUser = Omit<User, 'token'>
// 个人用户信息的TS类型声明
export type UserInfo = OmitUser & {
  // 关注数量
  likeNumber: number
  // 收藏数量
  collectionNumber: number
  // 我的总积分
  score: number
  // 我的优惠券数量
  couponNumber: number
  // 订单信息
  orderInfo: {
    // 待付款
    paidNumber: number
    // 待收货
    recieveNumber: number
    // 待发货
    shippedNumber: number
    // 已完成
    finishedNumber: number
  }
}

// 单个患者信息的TS类型
// 在添加患者时，不需要患者的id、genderValue和age，所以这几个属性都是可选项 加?
export type Patient = {
  // 患者姓名
  name: string
  // 患者身份证号
  idCard: string
  // 是否为默认患者 0不是默认患者 1是默认患者
  defaultFlag: 0 | 1
  // 性别 1男 0女
  gender: 0 | 1
  // 性别值
  genderValue?: string
  // 年龄
  age?: number
  id?: string
}
