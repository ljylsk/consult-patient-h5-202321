// 首页的TS类型声明

// 导入枚举类型
import type { ConsultType, IllnessTime } from '@/enums'

// 文章类型   推荐 | 减脂 | 饮食 | 关注
export type KnowledgeType = 'recommend' | 'fatReduction' | 'food' | 'like'

// 文章信息
export type Knowledge = {
  title: string // 文章标题
  id: string // 文章id
  coverUrl: string[] // 封面地址
  topic: string // 百科关联的话题
  collectionNumber: number // 收藏数量
  commentNumber: number // 评论数量
  creatorName: string // 创建人姓名
  creatorAvatar: string // 创建人头像
  creatorHospatalName: string // 创建人医院
  creatorDep: string // 创建人科室
  creatorTitles: string // 创建人职称
  likeFlag: 0 | 1 // 是否关注 0未关注 1关注
  content: string // 内容详情
  creatorId: string // 创建人id
}

// 文章列表
export type KnowledgeList = Knowledge[]

// 分页文章
export type KnowledgePage = {
  pageTotal: number // 总页数
  total: number // 总条数
  rows: KnowledgeList // 数据
}

/* 
// 文章查询参数
export type KnowledgeParams = {
  type: KnowledgeType // 文章类型
  current: number // 当前页码
  pageSize: number // 每页条数
} 
*/

// ------

// 分页通用的查询参数
export type PageParams = {
  current: number // 当前页码
  pageSize: number // 每页条数
}

// 文章列表查询参数
export type KnowledgeParams = PageParams & {
  type: KnowledgeType // 文章类型
}

// 医生卡片对象
export type Doctor = {
  id: string // 医生id
  name: string // 医生姓名
  avatar: string // 医生头像
  hospitalName: string // 医院名称
  gradeName: string // 医院等级-名称简写
  depName: string // 科室名称
  positionalTitles: string // 职称
  likeFlag: 0 | 1 // 未登录用户默认返回0，登录用户 1已关注0未关注
  serviceFee: number // 接诊费用
  consultationNum: number
  score: number
  major: string
}

// 医生列表
export type DoctorList = Doctor[]

// 医生分页
export type DoctorPage = {
  pageTotal: number // 总页数
  total: number // 总条数
  rows: DoctorList // 数据
}

// ------

// 关注的类型   百科话题 | 百科文章 | 医生 | 疾病
export type FollowType = 'topic' | 'knowledge' | 'doc' | 'disease'

// ------

// 图片
export type Image = {
  id: string // 图片id
  url: string // 图片地址
}
// 问诊记录
export type Consult = {
  id: string // 问诊记录id
  type: ConsultType // 就诊类型
  couponId: string // 使用优惠券，必传可使用优惠券id
  illnessType: 0 | 1 // 极速问诊类型：0普通1三甲
  patientId: string // 患者id，用于关联患者信息
  depId: string // 选择的科室id
  illnessDesc: string // 病情描述
  illnessTime: IllnessTime // 患病时间
  consultFlag: 0 | 1 // 是否就诊过，0未就诊1就诊过
  pictures: Image[] // 图片集合
}
// 因为问诊时是一个一个值加上去的，所以最好全部都是可选属性
// partial 将对象类型的属性全部转为可选属性 另：required 将对象类型的属性全部转为必选属性
export type PartialConsult = Partial<Consult>

// ------

// 二级科室
export type SubDep = {
  id: string // 科室id
  name: string // 科室名称
}

// 一级科室
export type TopDep = SubDep & {
  child: SubDep[] // 二级科室集合
}

// ------

// 病情描述(图文问诊)
// 从某TS类型中摘取某些属性 Pick<类型别名, '属性名' | '属性名'>
export type ConsultIllness = Pick<
  PartialConsult,
  'illnessDesc' | 'illnessTime' | 'consultFlag' | 'pictures'
>

// ------

// 问诊-支付页面-计算就诊信息和抵扣信息接口的参数
export type ConsultOrderPreParams = Pick<ParticalConsult, 'type' | 'illnessType'>

// 问诊-支付页面-就诊信息和抵扣信息
export type ConsultOrderPreData = {
  payment: number // 应付款/价格-图文或者极速的费用，极速普通10元，三甲39元
  pointDeduction: number // 积分可抵扣
  couponDeduction: number // 优惠券抵扣
  couponId: string // 使用的优惠券id-使用优惠券时，返回
  actualPayment: number // 实付金额
}

/* {
  liverFunction: 0 | 1 | 2 // 肝功能，0正常 1异常 2不清楚
    renalFunction: 0 | 1 | 2 // 肾功能，0正常 1异常 2不清楚
    allergicHistory: 0 | 1 | 2 // 过敏史，0无 1有 2不清楚
    fertilityStatus: 0 | 1 | 2 | 3 // 生育状态及计划，0无 1备孕中 2已怀孕 3哺乳期
} */
