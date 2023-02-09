/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'prettier/prettier': [
      'warn',
      {
        singleQuote: true, // 单引号
        semi: false, // 分号
        printWidth: 100, // 每行代码宽度 100 字符
        trailingComma: 'none', // 对象/数组内最后面的逗号
        endOfLine: 'auto' // 行尾 列终端
      }
    ],
    // 多个单词的组件名字
    'vue/multi-word-component-names': [
      'warn',
      {
        ignores: ['index'] // 忽略index
      }
    ],
    'vue/no-setup-props-destructure': ['off'] // 当使用基于类型的声明时，eslint对props解构默认值会有提示(解构后丢失响应式) 不提示 因为显示地选择开启响应性语法糖
  }
}
