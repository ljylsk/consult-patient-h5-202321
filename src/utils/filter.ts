// 封装获取患病时间的文字和获取是否就诊过的文字的方法

import type { IllnessTime } from '@/enums'
import { illnessFlagOptions, illnessTimeOptions } from '@/services/constants'

// 获取患病时间的文字
export const getIllnessTimeText = (time?: IllnessTime) => {
  // 患者病情ConsultRecord可能为undefined(只有MsgType接收消息类型为21-CardPat患者病情时，才有值)，所以患者病情ConsultRecord中的illnessTime也可能为undefined，所以形参time后面加操作符?，否则调用该函数时，会提示报错：类型"IllnssTime | undefined"的参数不能赋给类型"IllnessTime"的参数
  // 找到llnessTimeOptions数组中的每个对象的value值等于time的对象中的label属性值
  return illnessTimeOptions.find((item) => item.value === time)?.label // illnessTimeOptions.find((item) => item.value === time) 找到llnessTimeOptions数组中的每个对象的value值等于time的对象
  // find() 方法对数组中存在的每个元素执行一次函数：如果找到函数返回 true 值的数组元素，则 find() 返回该数组元素的值（并且不检查剩余值），否则返回 undefined
}

// 获取是否就诊过的文字
export const getConsultFlagText = (flag?: 0 | 1) => {
  return illnessFlagOptions.find((item) => item.value === flag)?.label
}
