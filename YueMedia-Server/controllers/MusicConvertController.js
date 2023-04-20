// import modules
const router = require('express').Router()
const multer = require('multer')
const { analyseFileService, uploadConvertMusicService, deleteConvertMusicService, getSupportMusicCodecService, submitMusicConvertTaskService } = require('../services/MusicConvertService')
const { auth } = require('../middlewares/Auth')
const { errorHandler } = require('../middlewares/ErrorCatcher')

// 文件上传配置
const fileUpload = multer({
  limits: { fileSize: 100000000, files: 1 }
})

/**
 * @api {POST} /apis/convert/analyse 解析文件接口
 * @apiName analyseFile
 * @apiGroup MusicConvert
 * @apiName MusicConvert/analyseFile
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {Buffer} file 待解析文件
 */
router.post('/analyse', auth, fileUpload.single('file'), async (req, res) => {
  try {
    // 获取上传文件
    const file = req.file
    // Service
    const { code, data } = await analyseFileService(file)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    console.log(error)
    res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
})

// 转码音乐上传配置
const convertFileUpload = multer({
  limits: { fileSize: 100000000, files: 5 }
})

/**
 * @api {POST} /apis/convert/upload 上传待转码音乐文件接口
 * @apiName uploadConvertMusic
 * @apiGroup MusicConvert
 * @apiName MusicConvert/uploadConvertMusic
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {Buffer} files[] 待转码文件
 * @apiBody {String} [fileNames] JSON格式文件名数组
 */
router.post('/upload', auth, convertFileUpload.array('file[]'), async (req, res) => {
  try {
    // 获取上传文件数组
    const files = req.files
    // Service
    const { code, data } = await uploadConvertMusicService(files, req.body.fileNames)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {DELETE} /apis/convert/upload 删除待转码音乐文件接口
 * @apiName deleteConvertMusic
 * @apiGroup MusicConvert
 * @apiName MusicConvert/deleteConvertMusic
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} filename 删除文件名
 */
router.delete('/upload', auth, async (req, res) => {
  try {
    // 获取删除文件名
    const targetFile = req.query.filename
    // Service
    const { code, data } = await deleteConvertMusicService(targetFile)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/convert/support 获取支持音乐格式接口
 * @apiName getSupportMusicCodec
 * @apiGroup MusicConvert
 * @apiName MusicConvert/getSupportMusicCodec
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/support', auth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getSupportMusicCodecService()
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {POST} /apis/convert/submit 提交音频转码任务接口
 * @apiName submitMusicConvertTask
 * @apiGroup MusicConvert
 * @apiName MusicConvert/submitMusicConvertTask
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {String} tasks 转码任务数组
 */
router.post('/submit', auth, async (req, res) => {
  try {
    // 获取待处理音频文件数组
    const { tasks } = req.body
    // Service
    const { code, data } = await submitMusicConvertTaskService(tasks, req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router