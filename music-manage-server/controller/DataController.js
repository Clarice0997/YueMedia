// import modules
const router = require('express').Router()
const { auth } = require('../config/Auth')
const { getLoginRecordService } = require('../service/DataService')
const { errorHandler } = require('../config/ErrorCatcher')

/**
 * @api {GET} /apis/data/login/record 获取登录记录数据接口
 * @apiName GetLoginRecord
 * @apiGroup Data
 * @apiName Data/GetLoginRecord
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/login/record', auth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getLoginRecordService()
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
