// id-validator插件的TS类型声明文件

// 在点击添加患者的弹出层页面中导入id-validator插件时，提示 没有找到“id-validator”的声明文件，鼠标放在id-validator上时提示：尝试使用 `npm i --save-dev @types/id-validator` (如果存在)，或者添加一个包含`declare module 'id-validator';`的新声明(.d.ts)文件

// 先使用id-validator插件再来写声明文件
// 根据使用方法【import IDValidator from 'id-validator'和const Validator = new IDValidator()】知道默认导出的是一个构造函数或类
// ES5 先有构造函数 new一下构造函数得到 对象实例；现在ES6 先有类 new一下类得到 对象实例
// 构造函数：添加属性 this.属性名 = 属性值；添加方法(通过原型链添加) 构造函数.protoype.方法名 = function() {}
// 但是在类里添加属性和方法是在 class 类名 {} 中直接添加
/* 
class Person {
  // Person为类的名字
  name = 'juanjuan' // 相当于构造函数上的一个属性
  say() {
    // 相当于构造函数原型链上的一个方法
    console.log('名字', this.name)
  }
}
// 对象实例
const person = new Person()
person.say() // 控制台输出结果为 名字 juanjuan 
*/
declare module 'id-validator' {
  export default class {
    isValid(id: string): boolean
    getInfo(id: string): {
      sex: number
    }
  }
}
