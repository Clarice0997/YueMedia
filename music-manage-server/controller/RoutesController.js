// import modules
const router = require('express').Router()
const { auth } = require('../config/Auth')
const { getRoutesService } = require('../service/RoutesService')
const { errorHandler } = require('../config/ErrorCatcher')

/**
 * @api {GET} /apis/routes 获取动态路由接口
 * @apiName GetRoutes
 * @apiGroup Routes
 * @apiName Routes/GetRoutes
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/', auth, async (req, res) => {
  // 获取 authorization
  const authorization = req.authorization
  // Service
  try {
    const { code, data } = await getRoutesService(authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
