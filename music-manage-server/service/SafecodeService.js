// 导入依赖包
let svgCaptcha = require('svg-captcha')

// 验证码生成相关参数
const captchaConfig = {
  // 翻转
  inverse: false,
  fontSize: 38,
  // 噪声线的条数
  noise: 3,
  width: 80,
  height: 32
}

function generateSafeCode(callback) {
  // 生成验证码
  const captcha = svgCaptcha.create(captchaConfig)
  // 验证码答案
  const captchaText = captcha.text
}

// 导出 Service
module.exports = { generateSafeCode }
