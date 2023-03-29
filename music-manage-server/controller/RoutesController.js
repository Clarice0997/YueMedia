// import modules
const router = require('express').Router()
const { auth } = require('../config/Auth')
const { getRoutesService } = require('../service/RoutesService')

/**
 * 获取路由对象接口
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
    console.log(err)
  }
})

module.exports = router
