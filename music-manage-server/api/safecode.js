// 导入依赖包
let svgCaptcha = require('svg-captcha')

// 导入路由
const router = require('express').Router()

// 获取验证码接口
router.get('/', (req, res) => {
  // 生成验证码 svg矢量图 定义相关参数
  const captcha = svgCaptcha.create({
    // 翻转
    inverse: false,
    fontSize: 38,
    // 噪声线的条数
    noise: 3,
    width: 80,
    height: 32
  })

  // 验证码文本
  const captchaText = captcha.text
  // cookie 返回验证码文本
  res.cookie('capchaText', captchaText)

  // 设置返回请求头
  res.setHeader('Content-Type', 'image/svg+xml')
  res.send(String(captcha.data))
})

module.exports = router
