// 导入路由
const router = require('express').Router()

// 导入 Service
const { generateSafeCode } = require('../service/SafecodeService')

// 获取验证码接口
router.get('/', (req, res) => {
  // 解构获取 type
  const { type } = req.query

  // 设置返回请求头
  res.setHeader('Content-Type', 'image/svg+xml')

  // Service
  generateSafeCode(type, result => {
    if (result.code === 200) {
      res.cookie('uuid', result.data.uuid)
      res.status(result.code).send(String(result.data.svg))
    } else {
      res.status(result.code).send(result.data)
    }
  })
})

module.exports = router
