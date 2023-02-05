import { createRouter, createWebHistory } from 'vue-router'

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
    // 登录页
    {
      path: '/login',
      component: () => import('@/views/Login/index.vue') // 路由懒加载
    }
  ]
})

export default router
