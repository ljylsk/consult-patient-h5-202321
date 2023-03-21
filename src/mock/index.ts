import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs' // 提示：
// 无法找到模块“mockjs”的声明文件。“E:/就业班/阶段5 Vue.js项目实战开发/练习/03-vue3优医问诊项目/consult-patient-h5-202321/node_modules/.pnpm/registry.npmmirror.com+mockjs@1.1.0/node_modules/mockjs/dist/mock.js”隐式拥有 "any" 类型。
// 尝试使用 `npm i --save-dev @types/mockjs` (如果存在)，或者添加一个包含 `declare module 'mockjs';` 的新声明(.d.ts)文件ts(7016)
// 所以 pnpm i --save-dev @types/mockjs 安装mockjs的TS声明文件

const rules: MockMethod[] = [
  {
    url: '/patient/message/list', // mock接口是 vite 本地服务器提供的，请求的时候不能带上其他服务器的域名。
    method: 'get',
    timeout: 1000,
    response: () => {
      const data = []
      for (let i = 0; i < 10; i++) {
        data.push(
          Mock.mock({
            id: '@id',
            avatar: '@image("100x100")',
            title: '@ctitle(3,10)',
            lastContent: '@ctitle(10,40)',
            sendTime: '@datetime()'
          })
        )
      }
      return {
        code: 10000,
        message: '获取数据成功',
        data
      }
    }
  }
]

export default rules

// 测试详见@/src/views/Login/index.vue中
