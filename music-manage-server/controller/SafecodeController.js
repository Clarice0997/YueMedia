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
  try {
    const { code, data } = await generateSafeCode(type)
    // response
    if (code === 200) {
      // response header
      res.setHeader('Content-Type', 'image/svg+xml')
      // response cookie
      res.cookie('uuid', data.uuid)
      res.status(code).send(String(data.svg))
    }
  } catch ({ code, data }) {
    res.status(code).send(data)
  }
})

module.exports = router
