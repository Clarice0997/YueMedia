// import modules
const router = require('express').Router()
const { auth } = require('../config/Auth')
const { getLoginRecordService } = require('../service/DataService')

// 获取登录记录接口
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
