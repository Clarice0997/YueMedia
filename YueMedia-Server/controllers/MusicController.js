// import modules
const router = require('express').Router()
const { auth } = require('../middlewares/Auth')
const multer = require('multer')
const path = require('path')
const {
  uploadMusicService,
  uploadMusicCoverService,
  uploadMusicDataService,
  deleteTempMusicService,
  selectMusicListService,
  uploadMusicBatchService,
  downloadMusicBatchService,
  deleteMusicBatchService,
  startPlayMusicService,
  downloadMusicService,
  deleteMusicService,
  updateMusicStatusService
} = require('../services/MusicService')
const { errorHandler, multerErrorHandler } = require('../middlewares/ErrorCatcher')
const { MulterError } = require('multer')

// 音频文件上传配置
const musicUpload = multer({
  limits: { fileSize: 100000000, files: 1 },
  fileFilter: function (req, file, cb) {
    // TODO: 校验重构
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
 * @api {POST} /apis/music/upload/music 音频文件上传接口
 * @apiName UploadMusicFile
 * @apiGroup Music
 * @apiName Music/UploadMusicFile
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiHeader {String} Content-Type multipart/form-data
 * @apiBody {Buffer} musicFile 音频文件
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

// 上传音频图片文件配置
const musicCoverUpload = multer({
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
 * @api {POST} /apis/music/upload/music/cover 音频封面上传接口
 * @apiName UploadMusicCover
 * @apiGroup Music
 * @apiName Music/UploadMusicCover
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiHeader {String} Content-Type multipart/form-data
 * @apiBody {Buffer} musicCoverFile 音频封面文件
 * @apiBody {String} musicName 音频文件名
 * @apiBody {String} originCoverName 原始音频封面文件名
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
 * @api {POST} /apis/music/upload/music/data 上传音频数据接口
 * @apiName UploadMusicData
 * @apiGroup Music
 * @apiName Music/UploadMusicData
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {String} songId 音频ID
 * @apiBody {String} songName 音频名
 * @apiBody {Number} songSize 音频大小(Byte)
 * @apiBody {String} musicCodec 音频编码格式
 * @apiBody {String} musicCoverFileName 音频封面文件名
 * @apiBody {String} musicFileName 音频文件名
 * @apiBody {String} [singerName] 音频歌手名
 * @apiBody {String} [albumName] 音频专辑名
 * @apiBody {Number} [year] 年份
 */
router.post('/upload/music/data', auth, async (req, res) => {
  try {
    // Service
    const { data, code } = await uploadMusicDataService(req.body, req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {DELETE} /apis/music/upload/music/temp 删除临时音频数据接口
 * @apiName DeleteTempMusicData
 * @apiGroup Music
 * @apiName Music/DeleteTempMusicData
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} musicName 音频文件名
 * @apiParam {String} coverName 封面文件名
 */
router.delete('/upload/music/temp', auth, async (req, res) => {
  try {
    // 获取临时音频 ID
    const { musicName, coverName } = req.query
    // Service
    const { data, code } = await deleteTempMusicService(musicName, coverName)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/music/ 获取个人音频列表、音频数量接口
 * @apiName selectMusicList
 * @apiGroup Music
 * @apiName Music/selectMusicList
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
    const { data, code } = await selectMusicListService(pageNumber, pageSize, req.authorization.uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

// 音频文件批量上传配置
const musicBatchUpload = multer({
  limits: { fileSize: 100000000, files: 5 },
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
 * @api {POST} /apis/music/upload/music/batch 批量上传音频文件接口
 * @apiName uploadMusicBatch
 * @apiGroup Music
 * @apiName Music/uploadMusicBatch
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {Buffer} musicFile[] 音频文件数组
 */
router.post(
  '/upload/music/batch',
  auth,
  // 上传文件中间件
  async (req, res, next) => {
    try {
      await musicBatchUpload.array('musicFile[]')(req, res, error => {
        if (error) {
          multerErrorHandler(error, req, res)
        } else {
          next()
        }
      })
    } catch (error) {
      await multerErrorHandler(error, req, res)
    }
  },
  async (req, res) => {
    try {
      // 获取上传文件
      const musicFiles = req.files
      // Service
      const { code, data } = await uploadMusicBatchService(musicFiles, req.authorization)
      // response
      res.status(code).send({ ...data, code })
    } catch (error) {
      errorHandler(error, req, res)
    }
  }
)

/**
 * @api {GET} /apis/music/download/music/batch 批量下载音频接口
 * @apiName downloadMusicBatch
 * @apiGroup Music
 * @apiName Music/downloadMusicBatch
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} fileList 下载文件数组JSON格式
 */
router.get('/download/music/batch', auth, async (req, res) => {
  try {
    // 获取上传文件
    const { fileList } = req.query
    // Service
    const { code, data } = await downloadMusicBatchService(JSON.parse(fileList), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {DELETE} /apis/music/delete/music/batch 批量删除音频接口
 * @apiName deleteMusicBatch
 * @apiGroup Music
 * @apiName Music/deleteMusicBatch
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} fileList 删除文件数组JSON格式
 */
router.delete('/delete/music/batch', auth, async (req, res) => {
  try {
    // 获取上传文件
    const { fileList } = req.query
    // Service
    const { code, data } = await deleteMusicBatchService(JSON.parse(fileList), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/music/play 开始播放音频接口
 * @apiName startPlayMusic
 * @apiGroup Music
 * @apiName Music/startPlayMusic
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} musicData 音频数据对象JSON格式
 */
router.get('/play', auth, async (req, res) => {
  try {
    // 获取上传文件
    const { musicData } = req.query
    // Service
    const { code, data } = await startPlayMusicService(JSON.parse(musicData), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/music/download/music 下载音频接口
 * @apiName downloadMusic
 * @apiGroup Music
 * @apiName Music/downloadMusic
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} musicData 音频数据对象JSON格式
 */
router.get('/download/music', auth, async (req, res) => {
  try {
    // 获取上传文件
    const { musicData } = req.query
    // Service
    const { code, data } = await downloadMusicService(JSON.parse(musicData), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {DELETE} /apis/music/delete/music 删除音频接口
 * @apiName deleteMusic
 * @apiGroup Music
 * @apiName Music/deleteMusic
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} musicData 音频数据对象JSON格式
 */
router.delete('/delete/music', auth, async (req, res) => {
  try {
    // 获取删除音频文件对象
    const { musicData } = req.query
    // Service
    const { code, data } = await deleteMusicService(JSON.parse(musicData), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {PUT} /apis/music/status 修改音频开放状态接口
 * @apiName updateMusicStatus
 * @apiGroup Music
 * @apiName Music/updateMusicStatus
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {String} musicData 音频数据对象JSON格式
 */
router.put('/status', auth, async (req, res) => {
  try {
    // 获取音频文件对象
    const { musicData } = req.body
    // Service
    const { code, data } = await updateMusicStatusService(JSON.parse(musicData), req.authorization)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
