export {}

// 枚举使用场景：用于一组没有语义的可选值，给它们添加类型。通过枚举可以让成员更加语义化，提高代码可读性
// 如果这组可选值语义很高，如 unpay | payed | complete ，使用字面量配合联合类型更简单些

/* 
// 使用枚举类型
enum Direction {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3
}
const changeDirection = (direction: Direction) => {
  console.log('方向值', direction)
}
// 使用枚举类型
changeDirection(Direction.Down) // 控制台输出结果为 方向值 2

// 创建枚举类型   枚举选项的值默认从0开始自增
enum Direction1 {
  Up1,
  Right1,
  Down1,
  Left1
}
const changeDirection1 = (direction: Direction1) => {
  console.log('方向值', direction)
}
changeDirection1(Direction1.Down1) // 控制台输出结果为 方向值 2

// 创建枚举类型   枚举选项的值从5开始自增
enum Direction2 {
  Up2 = 5,
  Right2,
  Down2,
  Left2
}
const changeDirection2 = (direction: Direction2) => {
  console.log('方向值', direction)
}
changeDirection2(Direction2.Down2) // 控制台输出结果为 方向值 7

// 创建枚举类型   枚举选项的值可以是字符串，且必须都是字符串
enum Direction3 {
  Up3 = 'Up3',
  Right3 = 'Right3',
  Down3 = 'Down3',
  Left3 = 'Left3'
}
const changeDirection3 = (direction: Direction3) => {
  console.log('方向值', direction)
}
changeDirection3(Direction3.Down3) // 控制台输出结果为 方向值 Down3

// 性别：Boy 男 Girl 女
enum GenderType {
  Boy,
  Girl
}
const showGender = (gender: GenderType) => {
  if (gender === GenderType.Boy) {
    console.log('男')
  }
}
showGender(GenderType.Boy) // 控制台输出结果为 男

// 订单状态：待付款1 已付款5 已完成8
enum OrderState {
  Unpaid = 1,
  Paid = 5,
  Completed = 8
}
const showOrderState = (state: OrderState) => {
  if (state === OrderState.Completed) {
    console.log('订单状态: 已完成')
  }
}
showOrderState(OrderState.Completed) // 控制台输出结果为 订单状态: 已完成 
*/

// 就诊类型枚举
export enum ConsultType {
  Doctor = 1, // 找医生
  Fast = 2, // 极速问诊
  Medication = 3 // 开药问诊
}
// 患病时间枚举 从1开始自增
export enum IllnessTime {
  Week = 1, // 一周内
  Month, // 一月内
  HalfYear, // 半年内
  More // 半年以上
}

// 医生问诊室接收消息类型的枚举 详见聊天-接收对话信息接口
export enum MsgType {
  // 文字
  MsgText = 1,
  // 图片
  MsgImage = 4,
  // 患者病情
  CardPat = 21,
  // 处方信息
  CardPre = 22,
  // 未提交评价
  CardEvaForm = 23,
  // 已提交评价
  CardEva = 24,
  // 普通通知
  Notify = 31,
  // 温馨提示
  NotifyTip = 32,
  // 订单取消
  NotifyCancel = 33
}
// 处方状态
export enum PrescriptionStatus {
  // 未购买
  NotPayment = 1,
  // 已购买
  Payment = 2,
  // 已失效
  Invalid = 3
}

// 订单状态
export enum OrderState {
  // 问诊订单
  ConsultPay = 1, // 待支付
  ConsultWait = 2, // 待接诊
  ConsultChat = 3, // 问诊中
  ConsultComplete = 4, // 问诊完成
  ConsultCancel = 5, // 取消问诊

  // 药品订单
  MedicinePay = 10, // 待支付
  MedicineSend = 11, // 待发货
  MedicineTake = 12, // 待收货
  MedicineComplete = 13, // 已完成
  MedicineCancel = 14 // 取消订单
}
