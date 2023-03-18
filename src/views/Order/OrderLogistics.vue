<!-- 物流详情页面组件 -->

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getMedicalOrderLogistics } from '@/services/order'
import { useRoute } from 'vue-router'
import type { Logistics } from '@/types/order'
// 1.2.6. 在高德地图组件中引入 amap-jsapi-loader
import AMapLoader from '@amap/amap-jsapi-loader'
import startImg from '@/assets/start.png'
import endImg from '@/assets/end.png'
import carImg from '@/assets/car.png'

// 获取当前路由地址
const route = useRoute()
// 定义物流信息的响应式数据
const logistics = ref<Logistics>()
// 组件挂载完成后执行该回调函数~
onMounted(async () => {
  // 调用接口获取物流信息
  const res = await getMedicalOrderLogistics(route.params.id as string)
  logistics.value = res.data
  /* // 调用接口获取物流信息是异步操作，需要①和②两种方法执行后面的代码
  // ①
  await nextTick()
  // 操作 #map 元素
  console.log(document.querySelector('#map'))
  // ②
  // 定时器
  setTimeout(() => {
    console.log(document.querySelector('#map'))
  }, 0) 
  */
  //  但是.then()也可以解决异步操作问题，不需要await nextTick()和定时器setTimeout()。.then()前面执行完才执行.then()，因为.then前面的代码执行也需要时间
  // 1.2.7. 高德地图初始化
  AMapLoader.load({
    key: '4eed3d61125c8b9c168fc22414aaef7e', // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0' // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    // plugins:[''], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      // 使用 Amap 初始化地图
      const map = new AMap.Map('map', {
        // map为高德地图容器的id属性值
        // 设置地图容器id
        // viewMode: '3D', //是否为3D地图模式
        zoom: 12, //初始化地图级别
        // center: [105.602725, 37.076636] //初始化地图中心点位置
        mapStyle: 'amap://styles/whitesmoke' //设置地图的显示样式
      })
      // 2.1 异步加载插件AMap.Driving
      AMap.plugin('AMap.Driving', function () {
        // 初始化路线规划对象
        const driving = new AMap.Driving({
          map: map, // AMap.Map对象, 展现结果的地图实例。当指定此参数后，搜索结果的标注、线路等均会自动添加到此地图上
          showTraffic: false, // 设置是否显示实时路况信息，默认设置为true。 显示绿色代表畅通，黄色代表轻微拥堵，红色代表比较拥堵，灰色表示无路况信息
          // 2.3 隐藏起终点和所有途经点的图标
          hideMarkers: true // 设置隐藏路径规划的起始点图标 设置为true：隐藏图标；设置false：显示图标\n默认值为：false
        })

        // 起点的经纬度
        // const startLngLat = [116.379028, 39.865042]
        const startLngLat = logistics.value?.logisticsInfo.shift() // shift() 方法从数组中删除第一个元素，并返回该元素的值。此方法更改数组的长度
        // 2.4 添加覆盖物(添加起点图标)
        // 构造点标记
        const startMarker = new AMap.Marker({
          // 图标
          icon: startImg,
          // 起点经纬度
          position: [startLngLat?.longitude, startLngLat?.latitude]
        })
        // 将起点覆盖物添加到地图上
        // 单独将点标记添加到地图上。可以传入一个覆盖物数组
        map.add(startMarker)
        // 终点的经纬度
        // const endLngLat = [116.427281, 39.903719]
        const endLngLat = logistics.value?.logisticsInfo.pop() // pop() 方法从数组中删除最后一个元素，并返回该元素的值。此方法会更改数组的长度
        // 注意：上面startLngLat和endLngLat获取到的都是个包含经纬度的对象。后面用到时，需要将对象转为数组
        // 注意：现在的logistics是个删除了第一个和最后一个元素的数组
        // 2.4 添加覆盖物(添加终点图标)
        // 构造点标记
        const endMarker = new AMap.Marker({
          // 图标
          icon: endImg,
          // 终点经纬度
          position: [endLngLat?.longitude, endLngLat?.latitude]
        })
        // 将终点覆盖物添加到地图上
        // 单独将点标记添加到地图上。可以传入一个覆盖物数组
        map.add(endMarker)

        driving.search(
          [startLngLat?.longitude, startLngLat?.latitude],
          [endLngLat?.longitude, endLngLat?.latitude],
          // 2.2 添加途经点参数
          {
            waypoints: logistics.value?.logisticsInfo.map((item) => [item.longitude, item.latitude])
            // map() 方法创建一个新数组，这个新数组由原数组中的每个元素都调用一次提供的函数后的返回值组成
          },
          function (status: string, result: object) {
            // 第一个参数：起点的经纬度(数组)；第二个参数：终点的经纬度(数组)；第三个参数：途经点；第四个参数：路线规划好了的回调函数
            // 未出错时，result即是对应的路线规划方案
            console.log(status, result)
            // 2.4 添加覆盖物(添加当前运输位置图标)
            // 构造点标记
            const currentMarker = new AMap.Marker({
              // 图标
              icon: carImg,
              // 当前运输位置经纬度
              position: [
                logistics.value?.currentLocationInfo.longitude,
                logistics.value?.currentLocationInfo.latitude
              ],
              // 锚点位置
              anchor: 'center'
            })
            // 将终点覆盖物添加到地图上
            // 单独将点标记添加到地图上。可以传入一个覆盖物数组
            map.add(currentMarker)

            // 2.5 3s后定位到当前运输位置，放大地图
            setTimeout(() => {
              // 自适应显示多个点标记。因为可以显示多个点标记，所以setFitView()方法内覆盖物传的是数组
              /* map.setFitView(
                [currentMarker], // 覆盖物数组
                false, // 动画是否立即过渡到指定位置
                [150, 60, 100, 60], // 上下左右的像素避让宽度
                10 // 最大 zoom 级别
              ) */
              map.setFitView([currentMarker])
              // 设置地图缩放级别
              map.setZoom(10)
            }, 3000)
          }
        )
      })
    })
    .catch((e) => {
      console.log(e)
    })
})

// 使用高德地图 JS API 开发地图应用：
// 一、把高德地图接入到 Vue 项目中。详见【高德开放平台 => 开发支持 => Web端 => 地图 JS API => 教程 => JSAPI结合Vue使用】
// 1.1 开发准备：
// 1.1.1  首先，注册开发者账号，成为高德开放平台开发者
// 1.1.2  登录之后，再进入「应用管理」 页面「创建新应用」
// 1.1.3 为应用添加 Key，「服务平台」一项请选择「 Web 端 ( JSAPI ) 」。
// 1.1.4 添加成功后，获取到 Key 值和 jscode 值。
// 1.2 地图组件开发和使用：
// 1.2.1 安装高德地图需要的js文件   pnpm add @amap/amap-jsapi-loader
// 1.2.2 v2.0需要配置 securityJsCode   v2.0 要加载的 JSAPI 的版本
window._AMapSecurityConfig = {
  securityJsCode: '415e917da833efcf2d5b69f4d821784b'
}
// 1.2.3 扩展Window的类型。详见env.d.ts。因为配置securityJsCode时提示 类型“Window & typeof globalThis”上不存在属性_AMapSecurityConfig
// 1.2.4 在高德地图组件中创建div标签作为高德地图容器 ，并设置地图容器的 id 属性
// 1.2.5 设置高德地图容器样式
// 1.2.6 在高德地图组件中引入 amap-jsapi-loader
// 1.2.7 高德地图初始化
// 二、使用经纬度获取驾车规划数据：【高德开放平台 => 开发支持 => Web端 => 地图 JS API => 教程 => 路线规划】
// 2.1 异步加载AMap.Driving插件 - 驾车路线规划服务，提供按照起、终点进行驾车路线的功能
// 2.2 添加途经点参数
// 2.3 隐藏起终点和所有途经点的图标
// 2.4 添加覆盖物(添加起、终点及当前运输位置图标)【高德开放平台 => 开发支持 => Web端 => 地图 JS API => 教程 => 覆盖物/图层管理】
// 2.5 3s后定位到当前运输位置，放大地图【高德开放平台 => 开发支持 => Web端 => 地图 JS API => 参考手册 => 地图 => Map => #setFitView => setFitView(overlays, immediately, avoid, maxZoom)】
</script>

<template>
  <div class="order-logistics-page">
    <!-- 1.2.4. 在高德地图组件中创建div标签作为高德地图容器 ，并设置地图容器的 id 属性，属性值为map -->
    <div id="map">
      <div class="title">
        <van-icon name="arrow-left" @click="$router.back()" />
        <span>{{ logistics?.statusValue }}</span>
        <van-icon name="service" />
      </div>
      <div class="current">
        <p class="status">订单派送中 预计明天送达</p>
        <p class="predict">
          <span>{{ logistics?.name }}</span>
          <span>{{ logistics?.awbNo }}</span>
        </p>
      </div>
    </div>
    <div class="logistics">
      <p class="title">物流详情</p>
      <!-- Vant 4 组件 Steps 步骤条 -->
      <!-- active 属性表示当前步骤的索引，从 0 起计 -->
      <!-- 可以通过设置 direction 属性来改变步骤条的显示方向。默认值为 horizontal，可选值为 vertical -->
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in logistics?.list" :key="item.id">
          <p class="status">{{ item.statusValue }}</p>
          <p class="content">{{ item.content }}</p>
          <p class="time">{{ item.createTime }}</p>
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-logistics-page {
  --van-step-icon-size: 18px;
  --van-step-circle-size: 10px;
}
// 1.2.5. 设置高德地图容器样式
#map {
  height: 450px;
  background-color: var(--cp-bg);
  overflow: hidden;
  position: relative;
  .title {
    background-color: #fff;
    height: 46px;
    width: 355px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    font-size: 16px;
    position: absolute;
    left: 10px;
    top: 10px;
    box-sizing: border-box;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    > span {
      flex: 1;
      text-align: center;
    }
    .van-icon {
      font-size: 18px;
      color: #666;
      &:last-child {
        color: var(--cp-primary);
      }
    }
  }
  .current {
    height: 80px;
    border-radius: 4px;
    background-color: #fff;
    height: 80px;
    width: 355px;
    box-sizing: border-box;
    padding: 15px;
    position: absolute;
    left: 10px;
    bottom: 10px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;
    .status {
      font-size: 15px;
      line-height: 26px;
    }
    .predict {
      color: var(--cp-tip);
      font-size: 13px;
      margin-top: 5px;
      > span {
        padding-right: 10px;
      }
    }
  }
}
.logistics {
  padding: 0 10px 20px;
  .title {
    font-size: 16px;
    padding: 15px 5px 5px;
  }
  .van-steps {
    :deep(.van-step) {
      &::after {
        display: none;
      }
    }
    .status {
      font-size: 15px;
      color: var(--cp-text3);
      margin-bottom: 4px;
    }
    .content {
      font-size: 13px;
      color: var(--cp-tip);
      margin-bottom: 4px;
    }
    .time {
      font-size: 13px;
      color: var(--cp-tag);
    }
  }
}
</style>
