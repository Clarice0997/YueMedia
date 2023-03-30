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
      res.cookie('type', data.type)
      res.status(code).send(String(data.svg))
    } else {
      res.status(code).send({ ...data, code })
    }
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

/**
 * 验证验证码接口
 */
router.get('/validate', async (req, res) => {
  // 解构获取参数
  const { answer } = req.query
  // 获取 Cookie 中的 uuid 和 type
  const { uuid, type } = req.cookies

  // Service
  try {
    const { code, data } = await validateSafeCode(type, answer, uuid)
    // response
    res.status(code).send({ ...data, code })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

module.exports = router
