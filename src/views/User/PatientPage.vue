<!-- 个人中心 - 家庭档案 页面 -->
<!-- 首页 - 选择患者 页面 -->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
// 按需导入TS类型
import type { Patient } from '@/types/user'
// 按需导入接口
import { getPatientList, addPatient, updatePatient, deletePatient } from '@/services/user'
import { useRoute } from 'vue-router'
import { showConfirmDialog, showSuccessToast, showToast } from 'vant'
// 导入问诊仓库
import { useConsultStore } from '@/stores'
// 导入中国大陆个人身份证号码验证器（JS版）
import IDValidator from 'id-validator'
import { nameRules } from '@/utils/rules'
import router from '@/router'

// 定义患者列表信息的响应式数据
const list = ref<Patient[]>([])
// 定义获取查询患者列表信息的函数【因为后续新增患者信息后，需要重新获取患者列表信息】
const getList = async () => {
  const res = await getPatientList()
  list.value = res.data
  // 默认选中患者
  changeDefaultPatient()
}
onMounted(() => {
  // 获取患者列表信息
  getList()
})

// 定义弹出层默认隐藏的响应式数据
const show = ref(false)
// 定义显示弹出层的函数
const showPopup = (item?: Patient) => {
  if (item) {
    // 编辑患者...
    // console.log(item) // 控制台输出结果为 Proxy {name: 'zs', idCard: '110101198307212600', defaultFlag: 0, gender: 0, genderValue: '女', …}
    // 数据回显
    // 解构点击的患者的信息对象【因为item对象中有多个属性，只把需要的属性解构出来即可】
    const { name, idCard, defaultFlag, gender, id } = item
    // 将解构出来的数据赋值给编辑患者的表单数据
    patient.value = { name, idCard, defaultFlag, gender, id }
  } else {
    // 添加患者...
    // 重置表单
    patient.value = { ...initPatient }
  }
  // 显示弹出层
  show.value = true
}
// 定义所有单选按钮上的文字内容
const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]

// 定义添加患者的表单数据
const initPatient: Patient = {
  // 患者姓名
  name: '',
  // 患者身份证号
  idCard: '',
  // 是否为默认患者 0不是默认患者 1是默认患者
  defaultFlag: 0,
  // 性别 1男 0女
  gender: 1
}
// 定义添加/编辑患者的表单的响应式数据
const patient = ref<Patient>({ ...initPatient })

// 默认患者：复选框选中时 patient.defaultFlag 是 1，复选框没选中时 patient.defaultFlag 是 0
// 获取值：如果 patient.defaultFlag 是 1，绑定的值就是 true，否则是 false
// 设置值：如果复选框v-model的属性值是 true，defaultFlag 的值就是 1，否则是 0
// 计算属性支持直接返回值的写法，还支持选项写法 包含 get 和 set 函数
// 直接返回值：取值但不能改值 const defaultFlag = computed(() => {})
const defaultFlag = computed({
  // 从 patient.defaultFlag 取值 给 复选框的v-model属性值，决定复选框的选中状态
  get() {
    // 如果 defaultFlag 等于 1 返回 true 复选框被选中
    return patient.value.defaultFlag === 1
  },
  // 给 patient.defaultFlag 设值。当复选框的v-model属性值为 true 时，patient.defaultFlag 值为 1，否则为 0
  set(val) {
    // val 为复选框 v-model的属性值
    patient.value.defaultFlag = val ? 1 : 0
  }
})

// 弹出层的表单提交
const submit = async () => {
  // 添加患者
  // 非空校验
  if (!patient.value.name) return showToast('请输入姓名')
  if (!patient.value.idCard) return showToast('请输入身份证号')
  // 验证身份证号码
  // 实例化查询器
  const Validator = new IDValidator()
  // 查询身份证号是否合法 不合法轻提示
  if (!Validator.isValid(patient.value.idCard)) return showToast('身份证号不正确')
  // 获取身份证号信息
  const info = Validator.getInfo(patient.value.idCard)
  // 选择的性别和身份证上的性别要一致
  if (info.sex !== patient.value.gender) return showToast('性别与身份证号不符')

  // 根据patient中是否有id判断是调用添加患者信息接口还是调用编辑患者信息接口
  patient.value.id ? await updatePatient(patient.value) : await addPatient(patient.value)
  // 关闭弹出层
  show.value = false
  // 调用获取查询患者列表信息的函数，重新获取患者列表信息
  getList()
  // 成功提示
  showSuccessToast(patient.value.id ? '编辑患者成功' : '添加患者成功')
}

// 删除患者
const remove = async () => {
  if (patient.value.id) {
    await showConfirmDialog({
      title: '温馨提示',
      message: '您确定要删除该患者信息吗？'
    })
    // 点击确认后执行下面的逻辑
    // 调用删除患者信息接口
    await deletePatient(patient.value.id)
    // 关闭弹出层
    show.value = false
    // 调用获取查询患者列表信息的函数，重新获取患者列表信息
    getList()
    // 成功提示
    showSuccessToast('删除患者成功')
  }
}

// ！！！选择患者页面逻辑:
// 1. 界面兼容，根据地址栏是否有标识
const route = useRoute()
// 是否是选择患者页面
const isChange = computed(() => route.query.isChange === '1') // 如果是首页下的选择患者页面，路由地址中携带isChange参数，且值为1；如果是个人中心的家庭档案页面，则没有参数
// console.log(isChange)
// 2. 点击选中患者
// 定义选中的患者的id的响应式数据
const patientId = ref<string>()
// 定义点击患者时的回调函数
const selectPatient = (item: Patient) => {
  // 只有选择患者页面点击患者时才需要记录患者id
  if (isChange.value) patientId.value = item.id
}
// 3. 默认选中患者，有默认患者就选默认患者，没有就选第一个患者
// 定义一个默认选中患者的函数。在调接口获取完患者信息列表后直接调用该函数
const changeDefaultPatient = () => {
  // 如果是选择患者页面且患者列表信息非空
  if (isChange.value && list.value.length) {
    // 找到患者信息列表list中的默认患者
    // find()方法返回数组中满足提供的测试函数的第一个元素的值，否则返回 undefined。filter()方法返回的是一个新的、由通过测试的元素组成的数组，如果没有任何数组元素通过测试，则返回空数组。
    const defPatient = list.value.find((item) => item.defaultFlag === 1)
    if (defPatient) {
      // 患者信息列表list中有默认患者
      // 选中的患者的id等于患者信息列表list中默认患者的id
      patientId.value = defPatient.id
    } else {
      // 患者信息列表list中没有默认患者
      // 选中的患者的id等于患者信息列表list中第一个患者的id
      patientId.value = list.value[0].id
    }
  }
}
// 4. 一定需要选中患者，存储患者id到仓库，跳转至支付页面
const store = useConsultStore()
// 定义点击下一步按钮的回调函数
const next = () => {
  // 如果没有选中患者，轻提示
  if (!patientId.value) return showToast('请选中一个患者')
  // 选中的患者的id存入问诊仓库的问诊记录中
  store.setPatient(patientId.value)
  // 跳转至支付页面
  router.push('/consult/pay')
}
//
</script>

<template>
  <div class="patient-page">
    <!-- 如果isChange为true，是选择患者页面，否则为家庭档案页面 -->
    <cp-nav-bar :title="isChange ? '选择患者' : '家庭档案'"></cp-nav-bar>

    <!-- 如果isChange为true，显示此块内容，否则不显示 -->
    <div class="patient-change" v-if="isChange">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>

    <div class="patient-list">
      <!-- 如果patientId等于点击的患者的id，则动态添加上类名selected(已设置了点击选中患者时的样式) => :class="{ selected: patientId === item.id }" -->
      <div
        class="patient-item"
        v-for="item in list"
        :key="item.id"
        @click="selectPatient(item)"
        :class="{ selected: patientId === item.id }"
      >
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <!-- 身份证脱敏 显示前6位和后4位 中间显示* .replace(/^(.{6})(?:\d+)(.{4})$/, '$1********$2') -->
          <span class="id">{{ item.idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '$1********$2') }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}</span>
        </div>
        <div @click="showPopup(item)" class="icon"><cp-icon name="user-edit" /></div>
        <!-- list患者列表信息中的defaultFlag属性值为1是默认患者 -->
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <!-- 因为最多可添加6人，所以当list患者列表信息中的数据少于6条时才会显示 添加患者 -->
      <div class="patient-add" v-if="list.length < 6" @click="showPopup()">
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>

    <!-- 底部按钮 -->
    <!-- 如果isChange为true，显示此按钮，否则不显示 -->
    <div class="patient-next" v-if="isChange">
      <van-button type="primary" round block @click="next">下一步</van-button>
    </div>

    <!-- Vant 4 组件 Popup 弹出层 -->
    <!-- v-model:show="show" 相当于 :show="show" 和 @update:show="show = $event" -->
    <van-popup v-model:show="show" position="right" :close-on-click-overlay="false">
      <!-- 将函数传递给CpNavBar组件，组件内使用back属性接收 -->
      <!-- 弹出层的标题是编辑患者还是添加患者取决于patient里是否有id -->
      <!-- 在此组件内点击CpNavBar导航栏组件上右侧的文字时，要实现的效果是函数submit【即子(CpNavBar导航栏组件)向父(PatientPage家庭档案组件)传值】 -->
      <!-- 注：从 Vant 4 开始，所有的事件均采用 Vue 官方推荐的驼峰格式进行命名。所以事件名clickRight采用小驼峰格式进行命名 -->
      <cp-nav-bar
        :back="
          () => {
            show = false
          }
        "
        :title="patient.id ? '编辑患者' : '添加患者'"
        :rightText="'保存'"
        @clickRight="submit"
      ></cp-nav-bar>
      <van-form>
        <van-field
          v-model="patient.name"
          label="真实姓名"
          placeholder="请输入真实姓名"
          autocomplete="off"
          :rules="nameRules"
        ></van-field>
        <van-field
          v-model="patient.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
          autocomplete="off"
        ></van-field>
        <van-field label="性别">
          <!-- 具名插槽input 自定义输入框 -->
          <template #input>
            <cp-radio-btn v-model="patient.gender" :options="options"></cp-radio-btn>
            <!-- :modelValue="gender" 和 @update:modelValue="gender = $event as number" 简写为 v-model="gender" -->
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <!-- v-model属性 是否为选中状态 默认是false。但是 patient.defaultFlag 的值是 0 或 1，所以需要v-model绑定计算属性 -->
            <van-checkbox v-model="defaultFlag" icon-size="18"></van-checkbox>
          </template>
        </van-field>
      </van-form>
      <!-- Vant 4 组件 ActionBar 动作栏 -->
      <!-- 编辑患者时弹出层的底部才有删除按钮，添加患者没有删除按钮 -->
      <van-action-bar v-if="patient.id">
        <van-action-bar-button text="删除" @click="remove"></van-action-bar-button>
      </van-action-bar>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.patient-page {
  padding: 46px 0 80px;
  // 样式穿透
  :deep() {
    .van-popup {
      width: 100%;
      height: 100%;
      padding-top: 46px;
      box-sizing: border-box;
    }
  }
}
.van-action-bar {
  padding: 0 10px;
  margin-bottom: 10px;
  .van-button {
    color: var(--cp-price);
    background-color: var(--cp-bg);
  }
}
.patient-list {
  padding: 15px;
}
.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;
  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;
      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }
      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }
  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }
  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &.selected {
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);
    .icon {
      color: var(--cp-primary);
    }
  }
}
.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;
  .cp-icon {
    font-size: 24px;
  }
}
.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}
.pb4 {
  padding-bottom: 4px;
}
.patient-change {
  padding: 15px;
  > h3 {
    font-weight: normal;
    margin-bottom: 5px;
  }
  > p {
    color: var(--cp-text3);
  }
}
.patient-next {
  padding: 15px;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 80px;
  box-sizing: border-box;
}
</style>
