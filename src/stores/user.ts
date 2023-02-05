import { defineStore } from 'pinia'
import type { User } from '../types/user'
import { ref } from 'vue'

// 定义用户状态仓库
export const useUserStore = defineStore(
  'cp-user',
  () => {
    // 1. 用户信息
    const user = ref<User>()
    // 2. 修改用户信息
    const setUser = (u: User) => {
      // 如果函数没有返回值且没有定义函数返回值类型时，默认为volid
      user.value = u // u 新的用户信息
    }
    // 3. 删除用户信息
    const delUser = () => {
      user.value = undefined
    }
    return { user, setUser, delUser }
  },
  {
    // 开启pinia仓库状态持久化 使用本地存储 默认是localStorage
    persist: true
  }
)
