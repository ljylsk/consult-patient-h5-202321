// 医生问诊室聊天-接收对话信息的TS类型

import type { PrescriptionStatus, MsgType } from '@/enums'
import type { Consult, Image } from './consult'
import type { Patient } from './user'

// 处方的药品信息
export type Medicines = {
  id: string // 主键id
  name: string // 药品名称
  amount: string // 药品价格
  avatar: string // 药品图片
  specs: string // 药品规格
  usageDosag: string // 药品用法用量
  prescriptionFlag: 0 | 1 // 是否是处方药0不是1是
  quantity: number // 药品数量
}
// 处方信息
export type Prescription = {
  id: string // 处方id
  createTime: string // 开方时间
  name: string // 患者姓名
  recordId: string // 就诊记录
  gender: 0 | 1 // 患者性别 0女1男
  genderValue: string // 患者的性别值
  age: number // 患者年龄
  diagnosis: string // 诊断信息
  status: PrescriptionStatus // 处方状态
  medicines: Medicines[] // 处方的药品信息
  orderId: string // 订单id信息
}
// 评价医生的信息
export type EvaluateDoc = {
  id?: string // 评价主键
  score?: number // 评价分数
  content?: string // 评价内容
  createTime?: string // 评价时间
  create?: string // 评价人
}
// 接收一条对话信息的TS类型   因为如果是获取历史聊天记录就不会有发送人和接收人，所以在发送人和接收人及头像后面加操作符?
export type Message = {
  id: string // 聊天消息id
  from?: string // 发送人
  fromAvatar?: string // 发送人头像
  to?: string // 接收人
  toAvatar?: string // 接收人头像
  msgType: MsgType // 消息的类型：1文字 21卡片-患者病情 22卡片-处方信息 23未提交评价 24已提交评价 31通知-普通通知(白底黑色) 32通知-温馨提示 33通知-订单取消(灰色底黑字) 4图片
  createTime: string // 发送时间
  // 聊天内容信息
  msg: {
    // msgType为21-患者病情信息
    consultRecord?: Consult & {
      patientInfo: Patient
    }
    prescription?: Prescription // msgType为22-处方信息
    content?: string // msgType为1或者3-文本类型内容
    picture?: Image // msgType为4-图片
    evaluateDoc?: EvaluateDoc // msgType为24-评价医生的信息
  }
  // 增加一条数据：是否需要滚动到最底部 布尔类型
  notScroll?: boolean
}
// 聊天-查询历史聊天记录的TS类型
export type TimeMessages = {
  sid: string // 会话id/socket链接id
  orderId: string // 订单id/关联业务id
  createTime: string // 会话时间
  items: Message[]
}
