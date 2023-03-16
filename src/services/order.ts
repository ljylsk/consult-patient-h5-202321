import type { AddressItem, OrderDetail, OrderPre } from '@/types/order'
import { request } from '@/utils/request'

// 订单-查询收货地址列表接口
export const getAddressList = () => request<AddressItem[]>('patient/order/address')

// 查询药品订单预支付信息接口(药品订单-支付药款页面-根据处方信息计算药款接口)
export const getMedicalOrderPre = (params: {
  prescriptionId: string // 处方id
  // couponId: string // 优惠券id
  // useCoupon: 0 | 1 = 1 // 是否使用优惠券。不传默认值为1，即使用优惠券，传0，不使用优惠券
  // 因为没有优惠券，所以请求参数couponId和useCoupon不用写了
}) => request<OrderPre>('patient/medicine/order/pre', 'GET', params)

// 药品订单-根据处方下药品订单接口
export const createMedicalOrder = (data: { id: string; couponId: string; addressId: string }) =>
  request<{ id: string }>('patient/medicine/order', 'POST', data)

// 药品订单-查询订单详情信息接口
export const getMedicalOrderDetail = (id: string) =>
  request<OrderDetail>(`patient/medicine/order/detail/${id}`)
