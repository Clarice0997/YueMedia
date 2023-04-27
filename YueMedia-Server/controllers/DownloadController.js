// import modules
const { auth } = require('../middlewares/Auth')
const router = require('express').Router()
const fs = require('fs')
const { errorHandler, downloadErrorHandler, playMusicErrorHandler } = require('../middlewares/ErrorCatcher')
const { downloadService, playMusicService, downloadPatchService, playVideoService } = require('../services/DownloadService')

/**
 * @api {GET} /apis/download 下载文件接口
 * @apiName Download
 * @apiGroup Download
 * @apiName Download/Download
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} downloadPath 下载地址
 * @apiParam {String} [downloadType] 下载类型
 */
router.get('/', auth, async (req, res) => {
  try {
    // 获取下载地址
    const { downloadPath, downloadType } = req.query
    // Service
    const { filename, mimetype, downloadRecord, concatDownloadPath, code, data } = await downloadService(downloadPath, downloadType, req)
    // 错误返回
    if (code === 500) return res.status(code).send({ ...data, code })
    // 设置响应头
    res.header('Access-Control-Expose-Headers', 'Content-Disposition')
    res.header('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename))
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
    res.header('Content-Disposition', 'inline; filename=' + encodeURIComponent(filename))
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

/**
 * @api {GET} /apis/download/video 视频播放接口
 * @apiName PlayVideo
 * @apiGroup Download
 * @apiName Download/PlayVideo
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} playVideoPath 视频地址
 */
router.get('/video', auth, async (req, res) => {
  try {
    // 获取播放音频文件地址
    const { playVideoPath } = req.query
    // Service
    const { filename, mimetype, playVideoRecord, filePath, code, data } = await playVideoService(playVideoPath, req)
    // 错误返回
    if (code === 500) return res.status(code).send({ ...data, code })
    // 设置响应头
    res.header('Access-Control-Expose-Headers', 'Content-Disposition')
    res.header('Content-Disposition', 'inline; filename=' + encodeURIComponent(filename))
    res.header('Content-Type', mimetype)
    // 音频文件读取流 管道传输 监听传输完毕事件&传输失败事件 更新音乐播放记录
    const stream = fs.createReadStream(filePath)
    try {
      stream.pipe(res).on('finish', async () => {
        playVideoRecord.status = 1
        playVideoRecord.downloadEndTime = new Date()
        playVideoRecord.downloadDuration = playVideoRecord.downloadEndTime - playVideoRecord.downloadStartTime
        await playVideoRecord.save()
      })
    } catch (error) {
      // 断开传输流
      stream.close()
      playVideoRecord.status = 2
      await playVideoRecord.save()
      await playMusicErrorHandler(error, req.ip)
    }
  } catch (error) {
    await errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/download/patch 下载处理任务压缩包接口
 * @apiName DownloadPatch
 * @apiGroup Download
 * @apiName Download/DownloadPatch
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} downloadPath 下载地址
 * @apiParam {String} [downloadType] 下载类型
 */
router.get('/patch', auth, async (req, res) => {
  try {
    // 获取下载地址
    const { downloadPath, downloadType } = req.query
    // Service
    const { filename, mimetype, downloadRecord, concatDownloadPath, code, data } = await downloadPatchService(downloadPath, downloadType, req)
    // 错误返回
    if (code === 500) return res.status(code).send({ ...data, code })
    // 设置响应头
    res.header('Access-Control-Expose-Headers', 'Content-Disposition')
    res.header('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename))
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

module.exports = router
