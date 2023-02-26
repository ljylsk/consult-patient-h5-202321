import { useUserStore } from '@/stores'
import { createRouter, createWebHistory } from 'vue-router'

// 进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({
  // 关闭右上角加载图标
  showSpinner: false
})

// vue2:
// 1. import VueRouter from 'vue-router'
// 2. const router = new VueRouter({ routes: [// 路由规则] })
// vue3:
// 1. import {createRouter} from 'vue-router'
// 2. const router = createRouter({})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // history属性配置历史模式：推荐使用createWebHistory() 创建HTML5模式；createWebHashHistory() 创建hash模式。路由基准地址import.meta.env.BASE_URL的值来自vite.config.ts文件中的base属性，配置项目的基础路径前缀，默认是'/' 新一代Vue脚手架(create-vue)提供的数据
  routes: [
    // 路由规则：
    // 没有底部导航栏的页面都是一级路由
    // 登录页
    {
      path: '/login',
      component: () => import('@/views/Login/index.vue'), // 路由懒加载
      meta: { title: '登录' }
    },
    // 布局容器
    {
      // 记录的路径
      path: '/',
      component: () => import('@/views/Layout/index.vue'),
      // 重定向
      redirect: '/home',
      // 当前记录的嵌套路由
      children: [
        {
          path: '/home',
          component: () => import('@/views/Home/index.vue'),
          meta: { title: '首页' }
        },
        {
          path: '/article',
          component: () => import('@/views/Article/index.vue'),
          meta: { title: '健康百科' }
        },
        {
          path: '/notify',
          component: () => import('@/views/Notify/index.vue'),
          meta: { title: '消息通知' }
        },
        {
          path: '/user',
          component: () => import('@/views/User/index.vue'),
          meta: { title: '个人中心' }
        }
      ]
    },
    // 家庭档案
    {
      path: '/user/patient',
      component: () => import('@/views/User/PatientPage.vue'),
      meta: { title: '家庭档案' }
    },
    // 极速问诊
    {
      path: '/consult/fast',
      component: () => import('@/views/Consult/ConsultFast.vue'),
      meta: { title: '极速问诊' }
    },
    // 选择科室
    {
      path: '/consult/dep',
      component: () => import('@/views/Consult/ConsultDep.vue'),
      meta: { title: '选择科室' }
    },
    // (病情描述)图文问诊
    {
      path: '/consult/illness',
      component: () => import('@/views/Consult/ConsultIllness.vue'),
      meta: { title: '图文问诊' }
    },
    // 支付
    {
      path: '/consult/pay',
      component: () => import('@/views/Consult/ConsultPay.vue'),
      meta: { title: '支付' }
    },
    // 问诊室
    {
      path: '/room',
      component: () => import('@/views/Room/index.vue'),
      meta: { title: '问诊室' }
    }
  ]
})

// 全局前置守卫 - 访问权限控制
router.beforeEach((to) => {
  // 开启进度条
  NProgress.start()
  // return true 或 不return => 直接放行
  // return '路由地址' => 拦截到某个页面
  const store = useUserStore()
  // 白名单
  const whiteList = ['/login']
  // 需求：当未登录即没有token 且 当前页面不是登录页 拦截到登录页
  if (!store.user?.token && !whiteList.includes(to.path)) return '/login'
})

// 全局后置钩子
router.afterEach((to) => {
  // 切换路由完成后修改标题
  document.title = `优医问诊-${to.meta.title || ''}`
  // 关闭进度条
  NProgress.done()
})

export default router
