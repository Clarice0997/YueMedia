// import modules
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const path = require('path')
const mime = require('mime')
const { DownloadRecord } = require('../models/downloadRecordModel')
const fs = require('fs')

/**
 * 下载 Service
 * @returns
 */
const downloadService = async (downloadPath, req) => {
  try {
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
    return {
      filename,
      mimetype,
      downloadRecord,
      concatDownloadPath
    }
  } catch (error) {
    ServiceErrorHandler(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

module.exports = { downloadService }
