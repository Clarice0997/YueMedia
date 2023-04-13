// import modules
const router = require('express').Router()
const { auth } = require('../middlewares/Auth')
const multer = require('multer')
const path = require('path')
const { uploadMusicService, uploadMusicCoverService, uploadMusicDataService, deleteTempMusicService } = require('../services/MusicService')
const { errorHandler, multerErrorHandler } = require('../middlewares/ErrorCatcher')
const { MulterError } = require('multer')

// 音乐文件上传配置
const musicUpload = multer({
  limits: { fileSize: 100000000, files: 1 },
  fileFilter: function (req, file, cb) {
    const allowedMimetypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/aiff', 'audio/alac', 'application/octet-stream']
    const allowedFiletypes = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'aiff', 'alac', 'ncm']

    const mimetype = allowedMimetypes.indexOf(file.mimetype) !== -1
    const extname = allowedFiletypes.indexOf(path.extname(file.originalname).toLowerCase().substring(1)) !== -1

    req.mimetype = file.mimetype

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new MulterError('仅允许 MP3，WAV，FLAC，NCM，AAC，OGG，AIFF，ALAC 格式的文件'))
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
      // 获取文件上传类型
      const mimetype = req.mimetype
      // Service
      const { code, data } = await uploadMusicService(musicFile, mimetype)
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
/**
 * @api {DELETE} /apis/music/upload/music/temp 删除临时音乐数据接口
 * @apiName DeleteTempMusicData
 * @apiGroup Music
 * @apiName Music/DeleteTempMusicData
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} musicName 音乐文件名
 * @apiParam {String} coverName 封面文件名
 */
router.delete('/upload/music/temp', auth, async (req, res) => {
  try {
    // 获取临时音乐 ID
    const { musicName, coverName } = req.query
    // Service
    const { data, code } = await deleteTempMusicService(musicName, coverName)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

// TODO: 获取音乐列表接口（分页|不分页结合）（返回数据包括歌曲权限）
router.get('/', auth, async (req, res) => {})

// TODO: 获取音乐数量接口
router.get('/count', auth, async (req, res) => {})

// TODO: 获取音乐接口
router.get('/:mid', auth, async (req, res) => {})

// TODO: 下载音乐接口
router.get('/download', auth, async (req, res) => {})

// TODO: 批量下载音乐接口
router.get('/download/batch', auth, async (req, res) => {})

// TODO: 普通音乐上传音乐文件（需要审核）

module.exports = router
