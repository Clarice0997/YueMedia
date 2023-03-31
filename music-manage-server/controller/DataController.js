// import modules
const router = require('express').Router()
const { auth } = require('../config/Auth')
const { getLoginRecordService } = require('../service/DataService')

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
    res.status(500).send({
      code: 500,
      data: {
        message: error.message
      }
    })
  }
})

module.exports = router
