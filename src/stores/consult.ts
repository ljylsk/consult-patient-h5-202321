import { defineStore } from 'pinia'
import { ref } from 'vue'
// 导入TS类型
import type { ConsultIllness, PartialConsult } from '@/types/consult'
// 导入枚举类型
import type { ConsultType } from '@/enums'

// 定义问诊仓库
export const useConsultStore = defineStore(
  'cp-consult',
  () => {
    // 问诊记录状态
    const consult = ref<PartialConsult>({})
    // 1. 设置就诊类型
    const setType = (type: ConsultType) => (consult.value.type = type)
    // 2. 设置极速问诊类型
    const setIllnessType = (type: 0 | 1) => (consult.value.illnessType = type)
    // 3. 设置科室id
    const setDep = (id: string) => (consult.value.depId = id)
    // 4. 设置病情描述(图文问诊)
    const setIllness = (illness: ConsultIllness) => {
      consult.value.illnessDesc = illness.illnessDesc // 病情描述
      consult.value.illnessTime = illness.illnessTime // 患病时间
      consult.value.consultFlag = illness.consultFlag // 是否就诊过
      consult.value.pictures = illness.pictures // 图片
    }
    // 5. 设置患者id
    const setPatient = (id: string) => (consult.value.patientId = id)
    // 6. 设置优惠券
    const setCoupon = (id?: string) => (consult.value.couponId = id)
    // 7. 清空信息
    const clear = () => (consult.value = {})
    return { consult, setType, setIllnessType, setDep, setIllness, setPatient, setCoupon, clear }
  },
  {
    // 开启pinia仓库状态持久化 使用本地存储 默认是localStorage
    persist: true
  }
)
