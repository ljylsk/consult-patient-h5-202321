// 二次封装axios
// 1. axios的配置
// 1.1 创建一个新的axios实例，配置基准地址和响应超时时间
// 1.2 添加请求拦截器，在请求头携带token
// 1.3 添加响应拦截器，判断业务是否成功，剥离无效数据，401错误拦截去登录页面

import router from '@/router'
import { useUserStore } from '@/stores'
import axios, { type Method } from 'axios'
import { showToast } from 'vant' // 局部引入vant4组件库中的showToast函数

const baseURL = 'https://consult-api.itheima.net/' // 访问本地API接口获取数据时使用的基础地址，详见接口文档。所以不需要区分是开发环境还是生产环境的地址
// 1.1 创建新axios实例
const instance = axios.create({
  // 基础地址
  baseURL,
  // 超时时间
  timeout: 10000
})

// 1.2 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 修改配置信息 比如：修改请求头...
    // 获取用户状态user中的token
    const store = useUserStore() // 不可写在请求拦截器外面。如果此ts文件比pinia文件加载的早，可能存在用户状态为undefined情况，会报错
    if (store.user?.token && config.headers) {
      config.headers.Authorization = `Bearer ${store.user.token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 1.3 响应拦截器
instance.interceptors.response.use(
  (res) => {
    // 状态码200是响应成功的，res.data.code是10000业务逻辑成功
    // 如果不是10000，业务逻辑失败，使用vant组件库中的Toast轻提示，报错阻断程序
    if (res.data?.code !== 10000) {
      showToast(res.data?.message || '网络异常') // vant4中Toast轻提示 => 调用showToast函数
      return Promise.reject(res.data)
    }
    // 业务逻辑成功，剥离返回的无效的响应数据
    return res.data
  },
  (err) => {
    // 响应出错
    // 401跳转登录
    if (err.response.status === 401) {
      // 删除用户信息
      const store = useUserStore()
      store.delUser()
      // 跳转到登录页，带上接口失效所在页面的地址，后续登录页面登录完成后回跳使用
      router.push(`/login?returnUrl=${router.currentRoute.value.fullPath}`) // push是router方法，以编程方式导航到一个新的 URL。currentRoute是router属性，表示当前路由地址，只读。是使用 ref 创建的数据，js 中使用需要加 .value。fullPath包括 path、 query 和 hash
    }
    return Promise.reject(err)
  }
)

// 定义泛型【类型别名后加上<类型参数> 就是泛型语法】
type Data<T> = {
  // 响应数据格式如下：
  code: number
  message: string
  data: T
}
// 2. 通用的请求工具函数
const request = <T>(
  url: string,
  method: Method = 'get', // method请求方式默认为get
  submitData?: object // 参数后面加?表示可选参数
) => {
  return instance.request<T, Data<T>>({
    // 若传{id: '111'}，则res是 res= {data: {id: '111'}}。但是响应拦截器中返回了res.data，所以request<数据类型, 数据类型>()指定res.data的类型
    url,
    method,
    // 区分get和其他请求
    // get请求提交数据时选项用params，其他请求提交数据时选项用data
    [method.toLowerCase() === 'get' ? 'params' : 'data']: submitData
  })
}

export { baseURL, instance, request }
