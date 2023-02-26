import { createApp } from 'vue'
import pinia from './stores'

import App from './App.vue'
import router from './router'

import 'vant/lib/index.css' // 全局引入vant组件库样式
import './styles/main.scss'

// 引入虚拟svg图标注册文件
import 'virtual:svg-icons-register'

// 导入枚举文件
import '@/enums'

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
