// import modules
const router = require('express').Router()
const { adminAuth, auth } = require('../middlewares/Auth')
const { getLoginRecordService, getUserTotalDataService, getOpenApiLineRecordService, getDownloadPieRecordService, getOpenApiPieRecordService, getDownloadLineRecordService, getSqlLineRecordService } = require('../services/DataService')
const { errorHandler } = require('../middlewares/ErrorCatcher')

/**
 * @api {GET} /apis/data/login/record 获取登录记录数据接口
 * @apiName GetLoginRecord
 * @apiGroup Data
 * @apiName Data/GetLoginRecord
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/login/record', adminAuth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getLoginRecordService()
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/data/ 获取用户概述数据接口
 * @apiName getUserTotalData
 * @apiGroup Data
 * @apiName Data/getUserTotalData
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/', auth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getUserTotalDataService(req.authorization.uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/data/openApi/lineRecord 获取 OPEN API 调用情况折线图数据接口
 * @apiName getOpenApiLineRecord
 * @apiGroup Data
 * @apiName Data/getOpenApiLineRecord
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/openApi/lineRecord', auth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getOpenApiLineRecordService(req.authorization.uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/data/download/pieRecord 获取下载类型饼图数据接口
 * @apiName getDownloadPieRecord
 * @apiGroup Data
 * @apiName Data/getDownloadPieRecord
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/download/pieRecord', auth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getDownloadPieRecordService(req.authorization.uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/data/download/lineRecord 获取下载折线图数据接口
 * @apiName getDownloadLineRecord
 * @apiGroup Data
 * @apiName Data/getDownloadLineRecord
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/download/lineRecord', auth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getDownloadLineRecordService(req.authorization.uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/data/openApi/pieRecord 获取 OPEN API 调用情况饼图数据接口
 * @apiName getOpenApiPieRecord
 * @apiGroup Data
 * @apiName Data/getOpenApiPieRecord
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/openApi/pieRecord', auth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getOpenApiPieRecordService(req.authorization.uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/data/sql/lineRecord 获取 SQL 折线图数据接口
 * @apiName getSqlLineRecord
 * @apiGroup Data
 * @apiName Data/getSqlLineRecord
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/sql/lineRecord', adminAuth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getSqlLineRecordService()
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
