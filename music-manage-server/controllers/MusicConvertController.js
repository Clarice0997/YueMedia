// import modules
const router = require('express').Router()
const multer = require('multer')
const { analyseFileService } = require('../services/MusicConvertService')
const { auth } = require('../middlewares/Auth')

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

module.exports = router
