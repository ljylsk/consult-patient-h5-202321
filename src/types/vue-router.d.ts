// 路由元信息meta的TS类型声明文件【通过扩展 RouteMeta 接口来输入meta里面的字段 即 .meta时出现meta里的所有字段供选择】因为meta里的字段不确定，所以vue-router没有对meta进行类型声明，当用到meta路由元信息时需要自定义类型声明

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}
