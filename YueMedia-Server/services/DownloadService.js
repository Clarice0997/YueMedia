// import modules
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const path = require('path')
const mime = require('mime')
const { DownloadRecord } = require('../models/downloadRecordModel')
const fs = require('fs')
const { PlayMusicRecord } = require('../models/playMusicRecordModel')

/**
 * 下载 Service
 * @param downloadPath
 * @param req
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

/**
 * 播放音乐 Service
 * @param playMusicPath
 * @param req
 * @returns
 */
const playMusicService = async (playMusicPath, req) => {
  try {
    // 拼接音频链接
    const concatMusicPath = path.join(process.env.DEFAULT_STATIC_PATH, playMusicPath)
    // 获取文件名
    const filename = path.basename(concatMusicPath)
    const mimetype = mime.getType(concatMusicPath)
    // 文件下载记录
    const playMusicRecord = new PlayMusicRecord({
      userId: req.authorization.uno,
      ip: req.ip,
      musicPath: playMusicPath,
      fileSize: fs.statSync(concatMusicPath).size,
      downloadStartTime: new Date()
    })
    return {
      filename,
      mimetype,
      playMusicRecord,
      filePath: concatMusicPath
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

module.exports = { downloadService, playMusicService }
