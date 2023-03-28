// 导入路由
const router = require('express').Router()

// 导入 Service
const { generateSafeCode, validateSafeCode } = require('../service/SafecodeService')

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
    } else {
      res.status(code).send(data)
    }
  } catch (err) {
    console.log(err)
  }
})

/**
 * 验证验证码接口
 */
router.get('/validate', async (req, res) => {
  // 解构获取参数
  const { type, answer } = req.query
  // 获取 Cookie 中的 uuid
  const uuid = req.cookies['uuid']

  // Service
  try {
    const { code, data } = await validateSafeCode(type, answer, uuid)
    // response
    res.status(code).send(data)
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
