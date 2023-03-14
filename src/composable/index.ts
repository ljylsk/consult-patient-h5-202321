// 逻辑复用

import { ref } from 'vue'
import { cancelOrder, deleteOrder, followTarget, getPrescriptionPic } from '@/services/consult'
import type { ConsultOrderItem, FollowType } from '@/types/consult'
import { showFailToast, showImagePreview, showSuccessToast } from 'vant'
import { OrderState } from '@/enums'

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
  // 返回变量loading和函数follow
  return { loading, follow }
}

// 封装查看处方的逻辑：
export const useShowPrescription = () => {
  // 定义点击 原始处方/查看处方 执行的逻辑函数
  const showPrescription = async (id?: string) => {
    if (id) {
      // 调用药品订单-根据处方ID查询处方单接口获取处方图片
      const res = await getPrescriptionPic(id)
      // Vant 4 组件 ImagePreview 图片预览
      showImagePreview([res.data.url])
    }
  }
  // 返回showPrescription函数
  return { showPrescription }
}

// 封装取消订单的逻辑:
export const useOrderCancel = () => {
  // 定义 取消订单 按钮的加载状态的响应式数据。默认为false不加载
  const loading = ref(false)
  // 定义 取消订单 按钮的点击事件的事件处理函数
  const onCancelOrder = async (item: ConsultOrderItem) => {
    // 开启 取消订单 按钮的加载状态
    loading.value = true

    // 调用取消订单接口
    /* // es2018以前的语法：
    try {
      await cancelOrder(item.id)
      // 取消订单成功
      // 修改问诊订单状态
      item.status = OrderState.ConsultCancel
      item.statusValue = '已取消'
      // Vant 4 组件 Toast 轻提示
      showToast('取消订单成功')
    } catch (e) {
      // 取消订单失败
      // Vant 4 组件 Toast 轻提示
      showToast('取消订单失败')
    } finally {
      // 无论取消成功或失败，都会执行
      // 关闭 取消订单 按钮的加载状态
      loading.value = false
    } 
    */

    // TypeScript 最高支持es2016语法【详见/node_models/@vue/tsconfig/tsconfig.web.json】，但是 finally() 方法是es2018新增。会提示：属性“finally”在类型“Promise<void>”上不存在。是否需要更改目标库? 请尝试将 “lib” 编译器选项更改为“es2018”或更高版本。所以在tsconfig.json中将 “lib” 编译器选项更改为“es2018”或更高版本即可解决

    // 调用取消订单接口
    // es2018的语法：新增finally() 方法
    cancelOrder(item.id)
      .then(() => {
        // 取消订单成功
        // 修改问诊订单状态
        item.status = OrderState.ConsultCancel
        item.statusValue = '已取消'
        // Vant 4 组件 Toast 轻提示
        showSuccessToast('取消订单成功')
      })
      .catch(() => {
        // 取消订单失败
        // Vant 4 组件 Toast 轻提示
        showFailToast('取消订单失败')
      })
      .finally(() => {
        // 无论取消订单成功或失败，都会执行
        // 关闭 取消订单 按钮的加载状态
        loading.value = false
      })
  }
  // 返回变量loading和函数onCancelOrder
  return { loading, onCancelOrder }
}

// 封装删除订单的逻辑：
// 删除订单的逻辑在问诊订单详情页面和每条问诊记录组件中都会用到，封装起来复用。区别是：在问诊订单详情页面上删除订单时，需要页面跳转至问诊记录页面，并且删除该条订单。解决方案是调用删除订单接口成功后，执行不同的逻辑(每条问诊记录的组件调用删除订单接口成功后，通知父组件问诊记录列表页面ConsultList.vue删除订单；而订单详情页面调用删除订单接口成功后跳转至问诊记录页面，并删除该条订单) => 删除订单的逻辑在封装成函数时，传入一个形参函数，在调用删除订单接口成功后调用，在每条问诊记录的组件和订单详情页面分别调用删除订单的逻辑函数时，传入所需的实参函数，实现调用后的功能(每条问诊记录的组件调用删除订单接口成功后，通知父组件问诊记录列表页面ConsultList.vue删除订单；订单详情页面调用删除订单接口成功后跳转至问诊记录页面，并删除该条订单)
export const useDeleteOrder = (callback: () => void) => {
  // 形参callback，是个函数，在调用删除订单接口成功后执行。
  // 定义点击 删除订单 按钮时的加载状态的响应式数据
  const loading = ref(false)
  /* 
  // 子组件(当前组件)通过 defineEmits 获取 emit 函数
  const emit = defineEmits<{
    // 事件名和传递的数据及函数返回值类型(如果函数没有返回值，返回值类型为void)
    (e: 'onDelete', id: string): void
  }>() 
  */
  // 定义 删除订单 按钮的点击事件的事件处理函数
  const deleteConsultOrder = (item: ConsultOrderItem) => {
    // 开启 删除订单 按钮的加载状态
    loading.value = true
    // 调用删除订单接口
    deleteOrder(item.id)
      .then(() => {
        // 删除订单成功：
        /* 
        // 通知父组件ConsultList.vue删除此条问诊记录
        // 子组件(当前组件)通过 emit 触发事件onDelete，并且传递数据
        emit('onDelete', item.id) 
        */

        // 删除订单成功后，每条问诊记录的组件通知父组件问诊记录列表组件删除该条订单；问诊详情页面跳转至问诊记录列表组件
        // 如果有函数callback，调用函数callback
        callback && callback()

        // Toast 轻提示
        showSuccessToast('删除订单成功')
      })
      .catch(() => {
        // 删除订单失败：
        showFailToast('删除订单失败')
      })
      .finally(() => {
        // 无论删除订单成功或失败都会执行：
        // 关闭 删除订单 按钮的加载状态
        loading.value = false
      })
  }
  // 返回变量deleteLoading和函数deleteConsultOrder
  return { loading, deleteConsultOrder }
}
