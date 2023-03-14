// 药品订单相关

import type { Medicines } from './room'

// 收货地址
export type AddressItem = {
  id: string // 收货地址id
  receiver: string // 收货人姓名
  addressDetail: string // 详细地址
  isDefault: 1 | 0 // 是否为默认，1为是，0为否
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
