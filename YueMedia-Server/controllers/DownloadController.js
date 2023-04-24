// import modules
const { auth } = require('../middlewares/Auth')
const router = require('express').Router()
const path = require('path')
const mime = require('mime')
const fs = require('fs')
const { DownloadRecord } = require('../models/downloadRecordModel')

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
  // 获取下载地址
  const { downloadPath } = req.query
  // 拼接下载链接
  const concatDownloadPath = path.join(process.env.DEFAULT_STATIC_PATH, process.env.DOWNLOAD_FOLDER, downloadPath)
  // 获取文件名
  const filename = path.basename(concatDownloadPath)
  const mimetype = mime.getType(concatDownloadPath)
  // 文件下载记录
  const downloadRecord = new DownloadRecord({
    userId: req.authorization.uno,
    ip: req.ip,
    downloadPath: downloadPath,
    fileSize: fs.statSync(concatDownloadPath).size,
    downloadStartTime: new Date()
  })
  await downloadRecord.save()
  // 设置响应头
  res.header('Access-Control-Expose-Headers', 'Content-Disposition')
  res.header('Content-Disposition', 'attachment; filename=' + filename)
  res.header('Content-Type', mimetype)
  // 文件读取流 管道传输 监听传输完毕事件&传输失败事件 更新文件下载记录
  const filestream = fs.createReadStream(concatDownloadPath)
  filestream
    .on('error', async error => {
      // TODO: 文件下载错误记录
      console.log(error)
      downloadRecord.status = 2
      await downloadRecord.save()
    })
    .pipe(res)
    .on('finish', async () => {
      downloadRecord.status = 1
      downloadRecord.downloadEndTime = new Date()
      downloadRecord.downloadDuration = downloadRecord.downloadEndTime - downloadRecord.downloadStartTime
      await downloadRecord.save()
    })
})

module.exports = router
