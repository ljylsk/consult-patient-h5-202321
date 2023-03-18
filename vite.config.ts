import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 自动按需导入vant组件【不需import引入了】：Vant 4 => 开发指南 => 快速上手 => 引入组件 => 方法二.按需引入组件样式 => 1.安装插件unplugin-vue-components => 2.在vite.config.ts文件配置插件
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers' // Vant解析器。此外还可以有ElementUi解析器ElementUiResolver, ElementPlus解析器ElementPlusResolver, AntDesign解析器AntDesignVueResolver等等

// 导入快速创建SVG精灵的Vite插件
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // base: '/', // 项目的基础路径前缀 默认是 '/'

  // QQ第三方登录需要将端口改为80(服务器默认的端口是5173，pnpm dev启动服务器时会看到)。另需要在 C:\Windows\System32\drivers\etc 下hosts文件中加入  127.0.0.1       consult-patients.itheima.net。将127.0.0.1域名映射成QQ登录备案的网站域名才可在用户授权QQ登录后成功跳转至网站回调地址/login/callback，否则会出现无法访问此网站的提示，拒绝连接请求。注： ICP备案对应的网站域名和网站回调地址都是在将申请QQ登录接入网站应用及移动应用前要填写的
  server: {
    port: 80, // 服务器启动的端口号
    host: true
    // open: true // 服务器启动时自动打开浏览器
  },

  plugins: [
    // 解析单文件组件的插件
    vue({
      // Props解构默认值时，需要显式地选择开启响应式语法糖
      reactivityTransform: true
    }),
    // 自动导入组件的插件 解析器可以是 vant element and-vue等等 且自动导入src/components文件夹下的组件，不需import ~ 直接使用
    Components({
      dts: false, // 默认是 true 开启自动生成组件的类型声明文件，vant组件已经有类型声明文件，只要导入了就会使用类型声明
      resolvers: [VantResolver({ importStyle: false })] // 在main.ts文件中已经引入了vant组件库的所有样式，不需要自动导入vant组件样式，只需要自动导入vant组件即可
    }),
    // 创建SVG精灵
    createSvgIconsPlugin({
      // 指定svg图标目录 绝对路径【node代码】
      iconDirs: [path.resolve(process.cwd(), 'src/icons')]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
