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
