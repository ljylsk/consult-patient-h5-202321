<!-- 病情描述(图文问诊)页面 -->

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// 导入TS类型
import type { ConsultIllness, Image } from '@/types/consult'
import { illnessTimeOptions, illnessFlagOptions } from '@/services/constants'
import type { UploaderAfterRead, UploaderFileListItem } from 'vant/lib/uploader/types'
// 导入接口函数
import { uploadImg } from '@/services/consult'
import { useRouter } from 'vue-router'
// 导入问诊仓库
import { useConsultStore } from '@/stores'
import { showConfirmDialog, showToast } from 'vant'

// 定义表单区域的响应式数据
const form = ref<ConsultIllness>({
  illnessDesc: '',
  illnessTime: undefined,
  consultFlag: undefined,
  pictures: []
})
// 因为下面两个数据在RoomMessage.vue组件中也会使用，所以单独提取到constants.ts文件中公用
/* // 定义患病时间按钮的数据
const illnessTimeOptions = [
  { label: '一周内', value: IllnessTime.Week },
  { label: '一月内', value: IllnessTime.Month },
  { label: '半年内', value: IllnessTime.HalfYear },
  { label: '半年以上', value: IllnessTime.More }
]
// 定义是否就诊过按钮的数据
const illnessFlagOptions = [
  { label: '就诊过', value: 1 },
  { label: '未就诊过', value: 0 }
] */

// 定义上传图片的响应式数据
const fileList = ref<Image[]>([])
// 定义文件上传完毕后会触发的回调函数
// 鼠标放在van-uploader组件的after-read属性上显示TS类型是 UploaderAfterRead | undefined
const onAfterRead: UploaderAfterRead = (item) => {
  /* console.log(item) // 选择一张图片后，控制台输出结果为
  Proxy {file: File, status: '', message: '', content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD…7DqmavRjqak+lRtN/DptFsSPWeZ3Td91jIDE4OCfGOshlJf/Z'}
    [[Handler]]: Object
    [[Target]]: Object
      content: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA
      file: File {name: '01a3d15fec599f11013fdcc7ade6cb.jpg@1280w_1l_0o_100sh.jpg', lastModified: 1625238676926, lastModifiedDate: Fri Jul 02 2021 23:11:16 GMT+0800 (中国标准时间), webkitRelativePath: '', size: 1033209, …}
      message: undefined
      status: "done"
      url: "http://yjy-teach-oss.oss-cn-beijing.aliyuncs.com/consult/production/20230219/6868257172062208.jpg"
      [[Prototype]]: Object
    [[IsRevoked]]: false */
  // 选择一张图片是 item，选择多张图片就是 item[]。我们是一张图
  // 如果上传了多张图片 直接返回
  if (Array.isArray(item)) return // Array.isArray() 方法确定对象是否为数组。如果对象是数组，则此函数返回 true，否则返回 false
  // 如果未上传图片 直接返回
  if (!item.file) return
  // 上传图片
  // 通过 status 属性可以标识上传状态，uploading 表示上传中，failed 表示上传失败，done 表示上传完成
  item.status = 'uploading'
  item.message = '上传中...'
  // 调用上传文件/图片接口
  uploadImg(item.file)
    .then((res) => {
      // 上传完成
      item.status = 'done'
      item.message = undefined // 上传完成不需要提示信息
      // 展示图片
      item.url = res.data.url
      // 上传的图片存储到form中
      form.value.pictures?.push(res.data)
    })
    .catch(() => {
      // 上传失败
      item.status = 'failed'
      item.message = '上传失败'
    })
}
// 定义删除文件预览时触发的事件
// 鼠标放在回调函数onAfterRead()的参数item上，显示TS类型为 UploaderFileListItem | UploaderFileListItem[]。这里的事件参数item和回调函数onAfterRead()的参数item是一样的，且选择的是一张图片，所以是 UploaderFileListItem
const onDelete = (item: UploaderFileListItem) => {
  // 删除图片
  // pic表示符合条件的每张图片
  form.value.pictures = form.value.pictures?.filter((pic) => pic.url !== item.url) // filter() 方法返回符合一定条件的元素
}

// 只有病情描述、患病时间、是否就诊过和上传图片4项中的前3项非空，下一步按钮才能点亮
const disabled = computed(
  () =>
    // 函数体只有一行时，可省略 {} 和 return
    !form.value.illnessDesc ||
    form.value.illnessTime === undefined ||
    form.value.consultFlag === undefined
)
// 调用useConsultStore()，创建store实例
const store = useConsultStore()
// 调用useRouter()，创建router实例
const router = useRouter()
// 定义点击下一步按钮的回调函数
const next = () => {
  // 非空校验
  if (!form.value.illnessDesc) return showToast('请输入病情描述')
  if (form.value.illnessTime === undefined) return showToast('请选择患病时间')
  if (form.value.consultFlag === undefined) return showToast('请选择是否就诊过')
  // 调用问诊仓库的病情描述函数
  store.setIllness(form.value)
  // 跳转至选择患者页面(与家庭档案页面共用) 需要根据 isChange 实现选择功能
  router.push('/user/patient?isChange=1')
}

// 数据回显：一种情况是一进入此页面，如果问诊仓库中有病情描述的数据，需要数据回显；另一种情况是从此页的下一页返回到此页，需要数据回显
// 组件挂载完成后执行~
onMounted(() => {
  // 判断问诊仓库的问诊记录consult中是否有病情描述。主要因为病情描述的字数如果多返回时就需要回显
  if (store.consult.illnessDesc) {
    // Vant 4 组件 Dialog 弹出框
    showConfirmDialog({
      title: '温馨提示',
      message: '是否恢复您之前填写的病情信息？',
      // closeOnPopstate选项	是否在页面回退时自动关闭
      // 从此页的下一页返回到此页，需要弹出确认弹框，进而进行数据回显。
      closeOnPopstate: false
    })
      .then(() => {
        // on confirm 确认
        // 从问诊仓库的问诊记录中取出数据
        const { illnessDesc, illnessTime, consultFlag, pictures } = store.consult
        // 将仓库中取出的数据赋值给页面上表单区域的响应式数据进行数据回显
        form.value = { illnessDesc, illnessTime, consultFlag, pictures }
        // 图片回显
        fileList.value = pictures || [] // 因为pictures被定义了的TS类型是Image[] 即 { id: string, url: string}[]。而fileList没有声明TS类型，提示不能将类型"{ id: string; url: string; }[] || undefined"分配给类型“never[]”，所以需要给 fileList 添加和 pictures 一样的TS类型 Image[]。又因为pictures还有可能是undefined，当pictures为undefined时，fileList或为[]
      })
      .catch(() => {
        // on cancel 取消
      })
  }
})
</script>

<template>
  <div class="consult-illness-page">
    <cp-nav-bar title="图文问诊"></cp-nav-bar>

    <!-- 医生提示 -->
    <div class="illness-tip van-hairline--bottom">
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <div class="info">
        <p class="tit">在线医生</p>
        <p class="tip">请描述你的疾病或症状、是否用药、就诊经历，需要我听过什么样的帮助</p>
        <p class="safe"><cp-icon name="consult-safe" /><span>内容仅医生可见</span></p>
      </div>
    </div>

    <!-- 表单区域 -->
    <div class="illness-form">
      <van-form>
        <van-field
          type="textarea"
          placeholder="请详细描述您的病情，病情描述不能为空"
          rows="3"
          v-model="form.illnessDesc"
        ></van-field>
      </van-form>
      <div class="item">
        <p>本次患病多久了？</p>
        <cp-radio-btn :options="illnessTimeOptions" v-model="form.illnessTime" />
      </div>
      <div class="item">
        <p>此次病情是否去医院就诊过？</p>
        <cp-radio-btn :options="illnessFlagOptions" v-model="form.consultFlag" />
      </div>
      <div class="illness-img">
        <!-- Vant 4 组件 Uploader 文件上传 -->
        <!-- upload-icon属性	上传区域图标名称或图片链接，等同于 Icon 组件的 name 属性 -->
        <!-- upload-text属性	上传区域文字提示 -->
        <!-- 通过 max-count 属性可以限制上传文件的数量，上传数量达到限制后，会自动隐藏上传区域 -->
        <!-- 通过 max-size 属性可以限制上传文件的大小，超过大小的文件会被自动过滤，这些文件信息可以通过 oversize 事件获取 -->
        <!-- 通过 v-model 可以绑定已经上传的文件列表，并展示文件列表的预览图 -->
        <!-- 文件上传完毕后会触发 after-read 回调函数，获取到对应的 file 对象 -->
        <!-- delete事件	删除文件预览时触发 -->
        <van-uploader
          upload-icon="photo-o"
          upload-text="上传图片"
          :max-count="9"
          :max-size="5 * 1024 * 1024"
          v-model="fileList"
          :after-read="onAfterRead"
          @delete="onDelete"
        ></van-uploader>
        <!-- 只有fileList数组的长度为0即未上传图片时，才显示该段提示 -->
        <p class="tip" v-if="!fileList.length">上传内容仅医生可见,最多9张图,最大5MB</p>
      </div>
    </div>

    <!-- Vant 4 组件 Button 按钮 -->
    <!-- 动态添加类名disabled => :class="{ disabled: disabled }" 其中第一个disabled表示动态类名，第二个disabled表示布尔类型的变量。当一对键值相同时，disabled: disabled 可简写为 disabled -->
    <van-button :class="{ disabled }" @click="next" type="primary" block round>下一步</van-button>
  </div>
</template>

<style lang="scss" scoped>
.consult-illness-page {
  padding-top: 46px;
}
.illness-tip {
  display: flex;
  padding: 15px;
  .img {
    width: 52px;
    height: 52px;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 10px;
  }
  .info {
    flex: 1;
    padding-left: 12px;
    .tit {
      font-size: 16px;
      margin-bottom: 5px;
    }
    .tip {
      padding: 12px;
      background: var(--cp-bg);
      color: var(--cp-text3);
      font-size: 13px;
      margin-bottom: 10px;
    }
    .safe {
      font-size: 10px;
      color: var(--cp-text3);
      display: flex;
      align-items: center;
      .cp-icon {
        font-size: 12px;
        margin-right: 2px;
      }
    }
  }
}
.illness-form {
  padding: 15px;
  .van-field {
    padding: 0;
    &::after {
      border-bottom: none;
    }
  }
  .item {
    > p {
      color: var(--cp-text3);
      padding: 15px 0;
    }
  }
}
.illness-img {
  padding-top: 16px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  .tip {
    font-size: 12px;
    color: var(--cp-tip);
  }
  ::v-deep() {
    .van-uploader {
      &__preview {
        &-delete {
          left: -6px;
          top: -6px;
          border-radius: 50%;
          background-color: var(--cp-primary);
          width: 20px;
          height: 20px;
          &-icon {
            transform: scale(0.9) translate(-22%, 22%);
          }
        }
        &-image {
          border-radius: 8px;
          overflow: hidden;
        }
      }
      &__upload {
        border-radius: 8px;
      }
      &__upload-icon {
        color: var(--cp-text3);
      }
    }
  }
}
.van-button {
  font-size: 16px;
  margin-bottom: 30px;
  &.disabled {
    opacity: 1;
    background: #fafafa;
    color: #d9dbde;
    border: #fafafa;
  }
}
</style>
