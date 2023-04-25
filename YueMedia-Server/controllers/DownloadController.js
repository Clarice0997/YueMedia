// import modules
const { auth } = require('../middlewares/Auth')
const router = require('express').Router()
const fs = require('fs')
const { errorHandler, downloadErrorHandler, playMusicErrorHandler } = require('../middlewares/ErrorCatcher')
const { downloadService, playMusicService } = require('../services/DownloadService')

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
    const { filename, mimetype, downloadRecord, concatDownloadPath, code, data } = await downloadService(downloadPath, req)
    // 错误返回
    if (code === 500) return res.status(code).send({ ...data, code })
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

/**
 * @api {GET} /apis/download/music 音频播放接口
 * @apiName PlayMusic
 * @apiGroup Download
 * @apiName Download/PlayMusic
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} playMusicPath 音频地址
 */
router.get('/music', auth, async (req, res) => {
  try {
    // 获取播放音频文件地址
    const { playMusicPath } = req.query
    // Service
    const { filename, mimetype, playMusicRecord, filePath, code, data } = await playMusicService(playMusicPath, req)
    // 错误返回
    if (code === 500) return res.status(code).send({ ...data, code })
    // 设置响应头
    res.header('Access-Control-Expose-Headers', 'Content-Disposition')
    res.header('Content-Disposition', 'inline; filename=' + filename)
    res.header('Content-Type', mimetype)
    // 音频文件读取流 管道传输 监听传输完毕事件&传输失败事件 更新音乐播放记录
    const stream = fs.createReadStream(filePath)
    try {
      stream.pipe(res).on('finish', async () => {
        playMusicRecord.status = 1
        playMusicRecord.downloadEndTime = new Date()
        playMusicRecord.downloadDuration = playMusicRecord.downloadEndTime - playMusicRecord.downloadStartTime
        await playMusicRecord.save()
      })
    } catch (error) {
      // 断开传输流
      stream.close()
      playMusicRecord.status = 2
      await playMusicRecord.save()
      await playMusicErrorHandler(error, req.ip)
    }
  } catch (error) {
    await errorHandler(error, req, res)
  }
})

// TODO: 转码音频下载接口

module.exports = router
