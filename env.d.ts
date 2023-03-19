/// <reference types="vite/client" />

// 扩展Window的类型
interface Window {
  // _AMapSecurityConfig的TS类型 用于高德地图
  _AMapSecurityConfig: {
    securityJsCode: string
  }
  // QC 相关的类型 用于QQ登录
  QC: {
    Login: {
      // 检查用户QQ登录是否授权的方法
      check(): boolean
      // 获取个人信息的方法，参数是回调函数，回调函数上的参数是openId
      getMe(cb: (openId: string) => void): void // // openId：用户身份的唯一标识。建议保存在本地，以便用户下次登录时可对应到其之前的身份信息，不需要重新授权
    }
  }
}
