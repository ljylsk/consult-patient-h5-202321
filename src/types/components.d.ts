// 给components文件夹下的全局通用组件，设置TS类型

// 导入组件实例/对象
import CpNavBar from '@/components/CpNavBar.vue'
import CpIcon from '@/components/CpIcon.vue'

/* 
const obj = {
  name: 'juanjuan',
  age: 17
}
type Obj = typeof obj // typeof 从一个JS对象中得到它对应的类型
const obj2: Obj = {
  name: 'feifei',
  age: 19
} 
*/

// 声明 vue 类型模块
declare module 'vue' {
  // 给 vue 添加全局通用组件类型
  // 使用 interface 声明对象类型。interface 重复定义对象，其中的属性和方法会合并
  interface GlobalComponents {
    // typeof 组件对象/实例，指定具体组件的TS类型，设置给全局通用组件CpNavBar等
    CpNavBar: typeof CpNavBar
    CpIcon: typeof CpIcon
  }
}
