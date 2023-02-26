import { request } from '@/utils/request'
// 导入TS类型
import type {
  ConsultOrderPreData,
  ConsultOrderPreParams,
  DoctorPage,
  FollowType,
  Image,
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  PartialConsult,
  TopDep
} from '@/types/consult'

// 首页-查询推荐/减脂/饮食健康/关注页面--百科文章列表接口
export const getKnowledgePage = (params: KnowledgeParams) =>
  request<KnowledgePage>('patient/home/knowledge', 'GET', params)

// 首页-关注的医生列表接口
export const getDoctorPage = (params: PageParams) =>
  request<DoctorPage>('home/page/doc', 'GET', params)

// 关注-关注操作接口 注：关注的类型默认为doc医生
export const followTarget = (type: FollowType = 'doc', id: string) =>
  request('like', 'POST', { type, id })

// 查询所有科室-层级接口
export const getAllDep = () => request<TopDep[]>('dep/all')

// 上传文件/图片接口
export const uploadImg = (file: File) => {
  // 创建一个空formData对象实例
  const fd = new FormData()
  // 添加数据 formData里面存储的数据形式，一对key/value组成一条数据
  fd.append('file', file) // 'file' 中的 file 是 key，file 是 value。因为接口文档中上传文件/图片接口的请求参数名为file，所以 key 必须为 file
  return request<Image>('upload', 'POST', fd)
}

// 问诊-支付页面-计算就诊信息和抵扣信息接口
// 获取生成订单的信息，后台根据 问诊类型 和 极速问诊级别，确定一些金额
export const getConsultOrderPre = (params: ConsultOrderPreParams) =>
  request<ConsultOrderPreData>('patient/consult/order/pre', 'GET', params)

// 问诊-保存/修改问诊订单
export const createConsultOrder = (data: PartialConsult) =>
  request<{ id: string }>('patient/consult/order', 'POST', data)

// 订单-支付接口
export const getConsultOrderPayUrl = (data: {
  paymentMethod: 0 | 1
  orderId: string
  payCallback: string
}) => request<{ payUrl: string }>('patient/consult/pay', 'POST', data)
