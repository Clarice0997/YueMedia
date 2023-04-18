// import modules
const router = require('express').Router()
const { errorHandler } = require('../middlewares/ErrorCatcher')
const { generateSafeCode, validateSafeCode } = require('../services/SafecodeService')

/**
 * @api {GET} /apis/safecode 获取验证码接口
 * @apiName GetSafeCode
 * @apiGroup SafeCode
 * @apiName SafeCode/GetSafeCode
 * @apiPermission All
 * @apiParam {String} [type] 验证码类型（数字|字符串）
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
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/safecode/validate 验证验证码接口
 * @apiName ValidateSafeCode
 * @apiGroup SafeCode
 * @apiName SafeCode/ValidateSafeCode
 * @apiPermission All
 * @apiParam {String} answer 验证码答案
 * @apiHeader {String} uuid Cookie&验证码id
 * @apiHeader {String} type Cookie&验证码类型
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
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
