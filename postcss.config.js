// 关闭下一行代码校验 关闭指定错误校对
// eslint-disable-next-line no-undef
module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      // 设备宽度375计算vw的值
      viewportWidth: 375
    }
  }
}
