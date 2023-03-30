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

// 上传封面图片接口
router.post('/upload/music/cover', auth, async (req, res) => {})

// 上传音乐数据接口
router.post('/upload/music/data', auth, async (req, res) => {})

module.exports = router
