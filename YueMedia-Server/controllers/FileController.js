// import modules
const router = require('express').Router()
const { auth } = require('../middlewares/Auth')
const { errorHandler } = require('../middlewares/ErrorCatcher')
const { getMyFileListService } = require('../services/FileService')

/**
 * @api {GET} /apis/file 获取个人处理文件列表接口
 * @apiName getMyFileList
 * @apiGroup File
 * @apiName File/getMyFileList
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {Number} [pageNumber] 页数
 * @apiParam {Number} [pageSize] 条数
 */
router.get('/', auth, async (req, res) => {
  try {
    // 获取分页数据
    const { pageNumber, pageSize } = req.query
    // Service
    const { code, data } = await getMyFileListService(pageNumber, pageSize, req.authorization.uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
