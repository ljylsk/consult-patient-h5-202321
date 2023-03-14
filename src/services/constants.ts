// 公用的常量数据

import { IllnessTime } from '@/enums'

// 定义患病时间按钮的数据
export const illnessTimeOptions = [
  { label: '一周内', value: IllnessTime.Week },
  { label: '一月内', value: IllnessTime.Month },
  { label: '半年内', value: IllnessTime.HalfYear },
  { label: '半年以上', value: IllnessTime.More }
]
// 定义是否就诊过按钮的数据
export const illnessFlagOptions = [
  { label: '就诊过', value: 1 },
  { label: '未就诊过', value: 0 }
]
