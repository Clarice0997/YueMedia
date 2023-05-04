// import modules
const router = require('express').Router()
const { auth } = require('../middlewares/Auth')
const multer = require('multer')
const { errorHandler, multerErrorHandler } = require('../middlewares/ErrorCatcher')
const { MulterError } = require('multer')
const {
  uploadVideoService,
  uploadVideoCoverService,
  uploadVideoDataService,
  deleteTempVideoService,
  selectVideoListService,
  downloadVideoService,
  startPlayVideoService,
  updateVideoStatusService,
  deleteVideoService,
  downloadVideoBatchService,
  deleteVideoBatchService,
  getSupportVideoCodecService
} = require('../services/VideoService')
const path = require('path')

// 视频文件上传配置
const videoUpload = multer({
  limits: { fileSize: 1000000000, files: 1 },
  fileFilter: function (req, file, cb) {
    // TODO: 校验重构
    const allowedMimetypes = ['video/x-flv', 'video/x-ms-wmv', 'video/quicktime', 'video/x-msvideo', 'video/mp4', 'video/avi']
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

/**
 * @api {GET} /apis/video/ 获取个人视频列表、视频数量接口
 * @apiName selectVideoList
 * @apiGroup Video
 * @apiName Video/selectVideoList
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
    const { data, code } = await selectVideoListService(pageNumber, pageSize, req.authorization.uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/video/download/video 下载视频接口
 * @apiName downloadVideo
 * @apiGroup Video
 * @apiName Video/downloadVideo
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} videoData 视频数据对象JSON格式
 */
router.get('/download/video', auth, async (req, res) => {
  try {
    // 获取上传文件
    const { videoData } = req.query
    // Service
    const { code, data } = await downloadVideoService(JSON.parse(videoData), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/video/play 开始播放视频接口
 * @apiName startPlayVideo
 * @apiGroup Video
 * @apiName Video/startPlayVideo
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} videoData 视频数据对象JSON格式
 */
router.get('/play', auth, async (req, res) => {
  try {
    // 获取上传文件
    const { videoData } = req.query
    // Service
    const { code, data } = await startPlayVideoService(JSON.parse(videoData), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {PUT} /apis/video/status 修改视频开放状态接口
 * @apiName updateVideoStatus
 * @apiGroup Video
 * @apiName Video/updateVideoStatus
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {String} videoData 视频数据对象JSON格式
 */
router.put('/status', auth, async (req, res) => {
  try {
    // 获取视频文件对象
    const { videoData } = req.body
    // Service
    const { code, data } = await updateVideoStatusService(JSON.parse(videoData), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {DELETE} /apis/video/delete/video 删除视频接口
 * @apiName deleteVideo
 * @apiGroup Video
 * @apiName Video/deleteVideo
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} videoData 视频数据对象JSON格式
 */
router.delete('/delete/video', auth, async (req, res) => {
  try {
    // 获取删除视频文件对象
    const { videoData } = req.query
    // Service
    const { code, data } = await deleteVideoService(JSON.parse(videoData), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/video/download/video/batch 批量下载视频接口
 * @apiName downloadVideoBatch
 * @apiGroup Video
 * @apiName Video/downloadVideoBatch
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} fileList 下载文件数组JSON格式
 */
router.get('/download/video/batch', auth, async (req, res) => {
  try {
    // 获取上传文件
    const { fileList } = req.query
    // Service
    const { code, data } = await downloadVideoBatchService(JSON.parse(fileList), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {DELETE} /apis/video/delete/video/batch 批量删除视频接口
 * @apiName deleteVideoBatch
 * @apiGroup Video
 * @apiName Video/deleteVideoBatch
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} fileList 删除文件数组JSON格式
 */
router.delete('/delete/video/batch', auth, async (req, res) => {
  try {
    // 获取上传文件
    const { fileList } = req.query
    // Service
    const { code, data } = await deleteVideoBatchService(JSON.parse(fileList), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/video/support 获取支持视频格式接口
 * @apiName getSupportVideoCodec
 * @apiGroup Video
 * @apiName Video/getSupportVideoCodec
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/support', auth, async (req, res) => {
  try {
    // Service
    const { code, data } = await getSupportVideoCodecService()
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
