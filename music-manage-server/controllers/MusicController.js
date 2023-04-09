// import modules
const router = require('express').Router()
const { auth } = require('../middlewares/Auth')
const multer = require('multer')
const path = require('path')
const { uploadMusicService, uploadMusicCoverService, uploadMusicDataService } = require('../services/MusicService')
const { errorHandler, multerErrorHandler } = require('../middlewares/ErrorCatcher')
const { MulterError } = require('multer')

// 音乐文件上传配置
const musicUpload = multer({
  limits: { fileSize: 100000000, files: 1 },
  fileFilter: function (req, file, cb) {
    const filetypes = /mp3|wav|flac|aac|m4a|ogg|wma|aiff|ape|alac|dsd/
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'audio/mpeg'
    const extname = filetypes.test(path.extname(file.originalname))
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new MulterError('仅允许MP3，WAV，FLAC，AAC，M4A，OGG，WMA，AIFF，APE，ALAC，DSD 格式的文件'))
    }
  }
})

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
router.post(
  '/upload/music',
  auth,
  async (req, res, next) => {
    try {
      await musicUpload.single('musicFile')(req, res, error => {
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
      const musicFile = req.file
      // Service
      const { code, data } = await uploadMusicService(musicFile)
      // response
      res.status(code).send({ ...data, code })
    } catch (error) {
      errorHandler(error, req, res)
    }
  }
)

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
    cb(new MulterError('仅允许 JPEG, JPG, PNG 格式的文件'))
  }
})

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
 * @apiBody {String} originCoverName 原始音乐封面文件名
 */
router.post(
  '/upload/music/cover',
  auth,
  async (req, res, next) => {
    try {
      await musicCoverUpload.single('musicCoverFile')(req, res, error => {
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
      const musicCoverFile = req.file
      // 获取原封面图名（可选）
      const { musicName, originCoverName } = req.body
      // Service
      const { data, code } = await uploadMusicCoverService(musicCoverFile, musicName, originCoverName)
      // response
      res.status(code).send({ ...data, code })
    } catch (error) {
      errorHandler(error, req, res)
    }
  }
)

/**
 * @api {POST} /apis/music/upload/music/data 上传音乐数据接口
 * @apiName UploadMusicData
 * @apiGroup Music
 * @apiName Music/UploadMusicData
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {String} songId 音乐ID
 * @apiBody {String} songName 音乐名
 * @apiBody {Number} songSize 音乐大小(Byte)
 * @apiBody {String} musicCodec 音乐编码格式
 * @apiBody {String} musicCoverFileName 音乐封面文件名
 * @apiBody {String} musicFileName 音乐文件名
 * @apiBody {String} [singerName] 音乐歌手名
 * @apiBody {String} [albumName] 音乐专辑名
 * @apiBody {Number} [year] 年份
 */
router.post('/upload/music/data', auth, async (req, res) => {
  try {
    // Service
    const { data, code } = await uploadMusicDataService(req.body)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

// TODO: 清除临时音乐文件 & 音乐封面文件接口（重置）

// TODO: 获取音乐列表接口（分页|不分页结合）（返回数据包括歌曲权限）

// TODO: 获取音乐数量接口

// TODO: 获取音乐接口

// TODO: 下载音乐接口

// TODO: 普通音乐上传音乐文件（需要审核）

// TODO: 批量下载音乐接口

module.exports = router
