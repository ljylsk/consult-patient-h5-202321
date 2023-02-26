// 逻辑复用

import { ref } from 'vue'
import { followTarget } from '@/services/consult'
import type { FollowType } from '@/types/consult'

// 封装 + 关注 / 已关注 按钮的逻辑：
export const useFollow = (type: FollowType) => {
  // type用来区分关注的类型
  // 关注 - 点击 + 关注 / 已关注 按钮的逻辑
  const loading = ref(false)
  // const follow = async (item: Doctor) => { // 如果给形参item传Doctor的TS类型，当文章的关注按钮处使用follow函数时传入的item实参的TS类型是Knowledge，会报错，所以这里的形参item只写用到的Doctor类型中的id和likeFlag。对象类型多的可以传给少的叫类型兼容【形参是Doctor类型中的部分，实参是全部】
  const follow = async (item: { id: string; likeFlag: number }) => {
    // 开启加载
    loading.value = true
    try {
      // 调用关注操作接口
      await followTarget(type, item.id)
      // 后端和前端数据取反 如1已关注 => 0未关注   0未关注 => 1已关注
      item.likeFlag = item.likeFlag === 1 ? 0 : 1
    } finally {
      // 无论异步操作成功还是失败 都会进入finally函数
      // 关闭加载
      loading.value = false
    }
  }
  return { loading, follow }
}
