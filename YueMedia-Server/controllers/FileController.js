// import modules
const router = require('express').Router()
const { auth } = require('../middlewares/Auth')
const { errorHandler } = require('../middlewares/ErrorCatcher')
const { getMyFileListService, deleteMyFileService, getMyFinishFileListService } = require('../services/FileService')

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

/**
 * @api {GET} /apis/file/finish 获取个人已处理文件列表接口
 * @apiName getMyFinishFileList
 * @apiGroup File
 * @apiName File/getMyFinishFileList
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/finish', auth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getMyFinishFileListService(req.authorization.uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/file 删除个人处理文件接口
 * @apiName deleteMyFile
 * @apiGroup File
 * @apiName File/deleteMyFile
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} taskId 任务ID
 */
router.delete('/', auth, async (req, res) => {
  try {
    // 获取分页数据
    const { taskId } = req.query
    // Service
    const { code, data } = await deleteMyFileService(taskId)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
