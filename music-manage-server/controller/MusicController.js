// import modules
const router = require('express').Router()
const { auth } = require('../config/Auth')
const multer = require('multer')
const path = require('path')
const { uploadMusicService, uploadMusicCoverService, uploadMusicDataService } = require('../service/MusicService')
const errorHandler = require('../config/ErrorCatcher')

// 音乐文件上传配置
const musicUpload = multer({
  limits: { fileSize: 100000000, files: 1 }
})

// TODO: 文件上传错误处理
/**
 * @api {POST} /apis/music/upload/music 音乐文件上传接口
 * @apiName UploadMusicFile
 * @apiGroup Music
 * @apiName Music/UploadMusicFile
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiHeader {String} Content-Type multipart/form-data
 * @apiBody {Buffer} musicFile 音乐文件
 */
router.post('/upload/music', auth, musicUpload.single('musicFile'), async (req, res, next) => {
  try {
    // 获取上传文件
    const musicFile = req.file
    // Service
    const { code, data } = await uploadMusicService(musicFile)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res, next)
  }
})

// 上传音乐图片文件配置
const musicCoverUpload = multer({
  limits: { fileSize: 50000000, files: 1 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname))
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Only JPEG, JPG, and PNG files are allowed'))
  }
})

// TODO: 文件上传错误处理
/**
 * @api {POST} /apis/music/upload/music/cover 音乐封面上传接口
 * @apiName UploadMusicCover
 * @apiGroup Music
 * @apiName Music/UploadMusicCover
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiHeader {String} Content-Type multipart/form-data
 * @apiBody {Buffer} musicCoverFile 音乐封面文件
 * @apiBody {String} musicName 音乐文件名
 * @apiBody {String} [originCoverName] 原始音乐封面文件名
 */
router.post('/upload/music/cover', auth, musicCoverUpload.single('musicCoverFile'), async (req, res, next) => {
  try {
    // 获取上传封面图
    const musicCoverFile = req.file
    // 获取原封面图名（可选）
    const { musicName, originCoverName } = req.body
    // 没有 musicName 则抛错
    if (!musicName) throw new Error('参数不合法')
    // Service
    const { data, code } = await uploadMusicCoverService(musicCoverFile, musicName, originCoverName)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res, next)
  }
})

// 上传音乐数据接口
router.post('/upload/music/data', auth, async (req, res, next) => {
  try {
  } catch (error) {
    errorHandler(error, req, res, next)
  }
})

module.exports = router
