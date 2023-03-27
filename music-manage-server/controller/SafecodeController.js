// 导入路由
const router = require('express').Router()

// 导入 Service
const { generateSafeCode } = require('../service/SafecodeService')

/**
 * 获取验证码接口
 */
router.get('/', async (req, res) => {
  // 解构获取 type
  const { type } = req.query

  // Service
  const { code, data } = await generateSafeCode(type)

  // response
  if (code === 200) {
    // response header
    res.setHeader('Content-Type', 'image/svg+xml')
    // response cookie
    res.cookie('uuid', data.uuid)
    res.status(code).send(String(data.svg))
  } else {
    res.status(code).send(data)
  }
})

module.exports = router
