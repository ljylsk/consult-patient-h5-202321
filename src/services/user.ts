// 用户相关的接口请求函数

// 按需导入TS类型
import type { CodeType, Patient, User, UserInfo } from '@/types/user'
import { request } from '@/utils/request'

// 密码登录接口
export const loginByPassword = (mobile: string, password: string) =>
  request<User>('login/password', 'post', { mobile, password })

// 获取手机验证码接口
export const sendMobileCode = (mobile: string, type: CodeType) =>
  request('code', 'get', { mobile, type })

// 短信验证码登录接口
export const loginByCode = (mobile: string, code: string) =>
  request<User>('login', 'post', { mobile, code })

// 获取个人用户信息接口
export const getUserInfo = () => request<UserInfo>('patient/myUser')

// 查询患者列表信息接口
export const getPatientList = () => request<Patient[]>('patient/mylist') // Patient为单个患者信息，而调用该接口返回的是患者列表信息，是个数组，所以<Patient[]>

// 添加患者信息接口
export const addPatient = (patient: Patient) => request('patient/add', 'post', patient)

// 编辑患者信息接口
export const updatePatient = (patient: Patient) => request('patient/update', 'put', patient)

// 删除患者信息接口
export const deletePatient = (id: string) => request(`patient/del/${id}`, 'delete')

// 问诊-查询患者详情接口
export const getPatientDetail = (id: string) => request<Patient>(`patient/info/${id}`)

// 登录--三方登录--qq三方登录接口
export const loginByQQ = (openId: string) =>
  request<User>('login/thirdparty', 'POST', { openId, source: 'qq' })

// 登录--绑定用户新-三方登录绑定手机号接口
export const bindMobile = (data: { mobile: string; code: string; openId: string }) =>
  request<User>('login/binding', 'POST', data)
