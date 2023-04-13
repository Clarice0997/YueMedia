// import modules
const router = require('express').Router()
const multer = require('multer')
const { fileAnalysis } = require('../services/MusicConvertService')

// 文件上传配置
const fileUpload = multer({
  limits: { fileSize: 100000000, files: 1 }
})

// 文件解析
router.post('/analyse', fileUpload.single('file'), async (req, res) => {
  try {
    // 获取上传文件
    const file = req.file
    // Service
    const { code, data } = await fileAnalysis(file)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    console.log(error)
    res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
})

module.exports = router
