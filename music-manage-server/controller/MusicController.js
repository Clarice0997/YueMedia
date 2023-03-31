// import modules
const router = require('express').Router()
const { auth } = require('../config/Auth')
const multer = require('multer')
const path = require('path')
const { uploadMusicService, uploadMusicCoverService, uploadMusicDataService } = require('../service/MusicService')

// 音乐文件上传配置
const musicUpload = multer({
  limits: { fileSize: 100000000, files: 1 }
})

// 上传音乐文件接口
router.post('/upload/music', auth, musicUpload.single('musicFile'), async (req, res) => {
  try {
    // 获取上传文件
    const musicFile = req.file
    // Service
    const { code, data } = await uploadMusicService(musicFile)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    res.status(500).send({
      code: 500,
      data: {
        message: error.message
      }
    })
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

// 上传封面图片接口
router.post('/upload/music/cover', auth, musicCoverUpload.single('musicCoverFile'), async (req, res) => {
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
    res.status(500).send({
      code: 500,
      data: {
        message: error.message
      }
    })
  }
})

// 上传音乐数据接口
router.post('/upload/music/data', auth, async (req, res) => {})

module.exports = router