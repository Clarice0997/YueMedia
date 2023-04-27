// import modules
const router = require('express').Router()
const { auth } = require('../middlewares/Auth')
const multer = require('multer')
const { errorHandler, multerErrorHandler } = require('../middlewares/ErrorCatcher')
const { MulterError } = require('multer')
const { uploadVideoService, uploadVideoCoverService, uploadVideoDataService, deleteTempVideoService } = require('../services/VideoService')
const path = require('path')

// 视频文件上传配置
const videoUpload = multer({
  limits: { fileSize: 1000000000, files: 1 },
  fileFilter: function (req, file, cb) {
    const allowedMimetypes = ['video/x-flv', 'video/x-ms-wmv', 'video/quicktime', 'video/x-msvideo', 'video/mp4']
    const mimetype = allowedMimetypes.indexOf(file.mimetype) !== -1

    req.mimetype = file.mimetype

    if (mimetype) {
      return cb(null, true)
    } else {
      cb(new MulterError('仅允许 MP4，AVI，MOV 格式的文件'))
    }
  }
})

/**
 * @api {POST} /apis/video/upload/video 视频文件上传接口
 * @apiName UploadVideoFile
 * @apiGroup Video
 * @apiName Video/UploadVideoFile
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiHeader {String} Content-Type multipart/form-data
 * @apiBody {Buffer} videoFile 视频文件
 */
router.post(
  '/upload/video',
  auth,
  async (req, res, next) => {
    try {
      await videoUpload.single('videoFile')(req, res, error => {
        if (error) {
          multerErrorHandler(error, req, res)
        } else {
          next()
        }
      })
    } catch (error) {
      multerErrorHandler(error, req, res)
    }
  },
  async (req, res) => {
    try {
      // 获取上传文件
      const videoFile = req.file
      // 获取文件上传类型
      const mimetype = req.mimetype
      // Service
      const { code, data } = await uploadVideoService(videoFile, mimetype)
      // response
      res.status(code).send({ ...data, code })
    } catch (error) {
      errorHandler(error, req, res)
    }
  }
)

// 上传视频图片文件配置
const videoCoverUpload = multer({
  limits: { fileSize: 10000000, files: 1 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname))
    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new MulterError('仅允许 JPEG, JPG, PNG 格式的文件'))
  }
})

/**
 * @api {POST} /apis/video/upload/video/cover 视频封面上传接口
 * @apiName UploadVideoCover
 * @apiGroup Video
 * @apiName Video/UploadVideoCover
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiHeader {String} Content-Type multipart/form-data
 * @apiBody {Buffer} videoCoverFile 视频封面文件
 * @apiBody {String} videoId 视频ID
 * @apiBody {String} videoCoverFileName 原始视频封面文件名
 */
router.post(
  '/upload/video/cover',
  auth,
  async (req, res, next) => {
    try {
      await videoCoverUpload.single('videoCoverFile')(req, res, error => {
        if (error) {
          multerErrorHandler(error, req, res)
        } else {
          next()
        }
      })
    } catch (error) {
      multerErrorHandler(error, req, res)
    }
  },
  async (req, res) => {
    try {
      // 获取上传封面图
      const videoCoverFile = req.file
      // 获取原封面名（可选）
      const { videoId, videoCoverFileName } = req.body
      // Service
      const { data, code } = await uploadVideoCoverService(videoCoverFile, videoId, videoCoverFileName)
      // response
      res.status(code).send({ ...data, code })
    } catch (error) {
      errorHandler(error, req, res)
    }
  }
)

/**
 * @api {POST} /apis/video/upload/video/data 上传视频数据接口
 * @apiName UploadVideoData
 * @apiGroup Video
 * @apiName Video/UploadVideoData
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {Object} videoData 视频数据
 */
router.post('/upload/video/data', auth, async (req, res) => {
  try {
    const { videoData } = req.body
    // Service
    const { data, code } = await uploadVideoDataService(videoData, req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {DELETE} /apis/video/upload/video/temp 删除临时视频文件接口
 * @apiName DeleteTempVideoData
 * @apiGroup Video
 * @apiName Video/DeleteTempVideoData
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} videoFileName 视频文件名
 * @apiParam {String} videoCoverFileName 视频封面文件名
 */
router.delete('/upload/video/temp', auth, async (req, res) => {
  try {
    // 获取临时文件文件名
    const { videoFileName, videoCoverFileName } = req.query
    // Service
    const { data, code } = await deleteTempVideoService(videoFileName, videoCoverFileName)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
