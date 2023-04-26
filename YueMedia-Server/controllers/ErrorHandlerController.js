// import modules
const { superAdminAuth } = require('../middlewares/Auth')
const { errorHandler } = require('../middlewares/ErrorCatcher')
const { getErrorsSerivce, updateErrorService } = require('../services/ErrorHandlerService')
const router = require('express').Router()

/**
 * @api {GET} /apis/error/errors 获取所有错误接口
 * @apiName getErrors
 * @apiGroup Error
 * @apiName Error/getErrors
 * @apiPermission SuperAdmin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {Number} errorType 错误类型 (0未处理 1已处理 2标记 3忽略)
 */
router.get('/errors', superAdminAuth, async (req, res) => {
  try {
    // 获取错误类型
    const { errorType } = req.query
    // Service
    const { code, data } = await getErrorsSerivce(errorType)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {PUT} /apis/error/errors 处理错误接口
 * @apiName updateError
 * @apiGroup Error
 * @apiName Error/updateError
 * @apiPermission SuperAdmin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {String} id 对应错误ID
 * @apiBody {Number} status 改变状态码
 */
router.put('/errors', superAdminAuth, async (req, res) => {
  try {
    const { id, status } = req.body
    // Service
    const { code, data } = await updateErrorService(id, status)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
