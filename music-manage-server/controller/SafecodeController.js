// 导入路由
const router = require('express').Router()

// 导入 Service
const { generateSafeCode } = require('../service/SafecodeService')

// 获取验证码接口
router.get('/', (req, res) => {
  // cookie 返回验证码文本
  res.cookie('capchaText', captchaText)

  // 设置返回请求头
  res.setHeader('Content-Type', 'image/svg+xml')
  res.send(String(captcha.data))
})

module.exports = router
