// import modules
const { auth } = require('../middlewares/Auth')
const router = require('express').Router()
const fs = require('fs')
const { errorHandler, downloadErrorHandler } = require('../middlewares/ErrorCatcher')
const { downloadService } = require('../services/DownloadService')

/**
 * @api {GET} /apis/download 下载文件接口
 * @apiName Download
 * @apiGroup Download
 * @apiName Download/Download
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} downloadPath 下载地址
 */
router.get('/', auth, async (req, res) => {
  try {
    // 获取下载地址
    const { downloadPath } = req.query
    // Service
    const { filename, mimetype, downloadRecord, concatDownloadPath } = await downloadService(downloadPath, req)
    // 设置响应头
    res.header('Access-Control-Expose-Headers', 'Content-Disposition')
    res.header('Content-Disposition', 'attachment; filename=' + filename)
    res.header('Content-Type', mimetype)
    // 文件读取流 管道传输 监听传输完毕事件&传输失败事件 更新文件下载记录
    const filestream = fs.createReadStream(concatDownloadPath)
    try {
      filestream.pipe(res).on('finish', async () => {
        downloadRecord.status = 1
        downloadRecord.downloadEndTime = new Date()
        downloadRecord.downloadDuration = downloadRecord.downloadEndTime - downloadRecord.downloadStartTime
        await downloadRecord.save()
      })
    } catch (error) {
      // 断开传输流
      filestream.close()
      downloadRecord.status = 2
      await downloadRecord.save()
      await downloadErrorHandler(error, req.ip)
    }
  } catch (error) {
    await errorHandler(error, req, res)
  }
})

// TODO: 音频播放接口
router.get('/music', auth, async (req, res) => {})

// TODO: 转码音频下载接口

module.exports = router
