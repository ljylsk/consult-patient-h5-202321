// 药品订单相关

import type { OrderState } from '@/enums'
import type { Medicines } from './room'

// 收货地址
export type AddressItem = {
  id: string // 收货地址id
  receiver: string // 收货人姓名
  addressDetail: string // 详细地址
  isDefault: 0 | 1 // 是否为默认，1为是，0为否
  mobile: string // 联系方式
  province: string // 省
  city: string // 市
  country: string // 区/县
}

// 药品订单预支付信息。详见药品订单-支付药款页面-根据处方信息计算药款接口
export type OrderPre = {
  id: string // 处方id
  pointDeduction: number // 积分可抵扣
  couponDeduction: number // 优惠券抵扣
  couponId: string // 使用的优惠券id
  payment: number // 应付金额(药品总价格)
  expressFee: number // 运费
  actualPayment: number // 实际支付
  medicines: Medicines[] // 药品信息
}

// 药品订单详情信息。详见药品订单-查询订单详情信息接口
export type OrderDetail = {
  id: string // 订单id
  orderNo: string // 订单编号
  type: 4 // 订单类型 1问医生2极速问诊3开药问诊4药品订单
  createTime: string // 订单创建时间
  prescriptionId: string // 处方id信息
  status: OrderState // 药品订单状态
  statusValue: string // 药品订单状态 10待支付11待发货12待收货13已完成14已取消
  cancelReason: string // 取消订单原因
  cancelReasonValue: string // 取消订单原因文字
  cancelProcess: string // 取消/退款进度
  medicines: Medicines[] // 处方的药品列表信息
  countdown: number // 待支付返回的倒计时 1表示已经结束，单位s
  addressInfo: AddressItem // 地址信息
  expressInfo: {
    content: string // 物流最新位置
    time: string // 物流最新时间
  } // 物流信息
  payTime: string // 支付时间
  paymentMethod: 0 | 1 // 支付方式 0微信支付 1支付宝支付
  payment: string // 应付款(药品总金额)
  couponDeduction: number // 优惠券抵扣金额
  expressFee: number // 运费
  actualPayment: number // 实际付款金额
  roomId: string // 药品订单对应处方的聊天室id
}
