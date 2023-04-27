// import modules
const { auth, openApiAuth } = require('../middlewares/Auth')
const { errorHandler, downloadErrorHandler } = require('../middlewares/ErrorCatcher')
const { getOpenApiTokenService, getPrivateMusicOpenapiService, getMusicOpenapiService, getPrivateVideoOpenapiService, getVideoOpenapiService } = require('../services/ApiService')
const fs = require('fs')
const router = require('express').Router()

/**
 * @api {GET} /apis/openapi 获取开放 API Token 接口
 * @apiName getOpenApiToken
 * @apiGroup Openapi
 * @apiName Openapi/getOpenApiToken
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {Date} [String] 过期时间
 */
router.get('/', auth, async (req, res) => {
  try {
    // 获取过期时间
    const { endDate } = req.query
    // Service
    const { code, data } = await getOpenApiTokenService(req.authorization, endDate)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/openapi/private/music 开放 API 获取私有音频文件接口
 * @apiName getPrivateMusicOpenapi
 * @apiGroup Openapi
 * @apiName Openapi/getPrivateMusicOpenapi
 * @apiPermission All
 * @apiHeader {String} Authorization Open API Token
 * @apiParam {String} musicPath 下载地址
 */
router.get('/private/music', openApiAuth, async (req, res) => {
  try {
    // 获取文件路径
    const { musicPath } = req.query
    // Service
    const { filename, mimetype, openApiRecord, concatFilePath, code, data } = await getPrivateMusicOpenapiService(musicPath, req)
    // 错误返回
    if (code === 500) return res.status(code).send({ ...data, code })
    // 设置响应头
    res.header('Access-Control-Expose-Headers', 'Content-Disposition')
    res.header('Content-Disposition', 'inline; filename=' + encodeURIComponent(filename))
    res.header('Content-Type', mimetype)
    // 文件读取流 管道传输 监听传输完毕事件&传输失败事件 更新文件下载记录
    const filestream = fs.createReadStream(concatFilePath)
    try {
      filestream.pipe(res).on('finish', async () => {
        openApiRecord.status = 1
        openApiRecord.endTime = new Date()
        openApiRecord.duration = openApiRecord.endTime - openApiRecord.startTime
        await openApiRecord.save()
      })
    } catch (error) {
      // 断开传输流
      filestream.close()
      openApiRecord.status = 2
      await openApiRecord.save()
      await downloadErrorHandler(error, req.ip)
    }
  } catch (error) {
    await errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/openapi/music 开放 API 获取公开音频文件接口
 * @apiName getMusicOpenapi
 * @apiGroup Openapi
 * @apiName Openapi/getMusicOpenapi
 * @apiPermission All
 * @apiParam {String} musicPath 下载地址
 */
router.get('/music', async (req, res) => {
  try {
    // 获取文件路径
    const { musicPath } = req.query
    // Service
    const { filename, mimetype, openApiRecord, concatFilePath, code, data } = await getMusicOpenapiService(musicPath, req)
    // 错误返回
    if (code === 500) return res.status(code).send({ ...data, code })
    // 设置响应头
    res.header('Access-Control-Expose-Headers', 'Content-Disposition')
    res.header('Content-Disposition', 'inline; filename=' + encodeURIComponent(filename))
    res.header('Content-Type', mimetype)
    // 文件读取流 管道传输 监听传输完毕事件&传输失败事件 更新文件下载记录
    const filestream = fs.createReadStream(concatFilePath)
    try {
      filestream.pipe(res).on('finish', async () => {
        openApiRecord.status = 1
        openApiRecord.endTime = new Date()
        openApiRecord.duration = openApiRecord.endTime - openApiRecord.startTime
        await openApiRecord.save()
      })
    } catch (error) {
      // 断开传输流
      filestream.close()
      openApiRecord.status = 2
      await openApiRecord.save()
      await downloadErrorHandler(error, req.ip)
    }
  } catch (error) {
    await errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/openapi/private/video 开放 API 获取私有视频文件接口
 * @apiName getPrivateVideoOpenapi
 * @apiGroup Openapi
 * @apiName Openapi/getPrivateVideoOpenapi
 * @apiPermission All
 * @apiHeader {String} Authorization Open API Token
 * @apiParam {String} videoPath 下载地址
 */
router.get('/private/video', openApiAuth, async (req, res) => {
  try {
    // 获取文件路径
    const { videoPath } = req.query
    // Service
    const { filename, mimetype, openApiRecord, concatFilePath, code, data } = await getPrivateVideoOpenapiService(videoPath, req)
    // 错误返回
    if (code === 500) return res.status(code).send({ ...data, code })
    // 设置响应头
    res.header('Access-Control-Expose-Headers', 'Content-Disposition')
    res.header('Content-Disposition', 'inline; filename=' + encodeURIComponent(filename))
    res.header('Content-Type', mimetype)
    // 文件读取流 管道传输 监听传输完毕事件&传输失败事件 更新文件下载记录
    const filestream = fs.createReadStream(concatFilePath)
    try {
      filestream.pipe(res).on('finish', async () => {
        openApiRecord.status = 1
        openApiRecord.endTime = new Date()
        openApiRecord.duration = openApiRecord.endTime - openApiRecord.startTime
        await openApiRecord.save()
      })
    } catch (error) {
      // 断开传输流
      filestream.close()
      openApiRecord.status = 2
      await openApiRecord.save()
      await downloadErrorHandler(error, req.ip)
    }
  } catch (error) {
    await errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/openapi/video 开放 API 获取公开视频文件接口
 * @apiName getVideoOpenapi
 * @apiGroup Openapi
 * @apiName Openapi/getVideoOpenapi
 * @apiPermission All
 * @apiParam {String} videoPath 下载地址
 */
router.get('/video', async (req, res) => {
  try {
    // 获取文件路径
    const { videoPath } = req.query
    // Service
    const { filename, mimetype, openApiRecord, concatFilePath, code, data } = await getVideoOpenapiService(videoPath, req)
    // 错误返回
    if (code === 500) return res.status(code).send({ ...data, code })
    // 设置响应头
    res.header('Access-Control-Expose-Headers', 'Content-Disposition')
    res.header('Content-Disposition', 'inline; filename=' + encodeURIComponent(filename))
    res.header('Content-Type', mimetype)
    // 文件读取流 管道传输 监听传输完毕事件&传输失败事件 更新文件下载记录
    const filestream = fs.createReadStream(concatFilePath)
    try {
      filestream
        .pipe(res)
        .on('close', async () => {
          openApiRecord.status = 1
          openApiRecord.endTime = new Date()
          openApiRecord.duration = openApiRecord.endTime - openApiRecord.startTime
          await openApiRecord.save()
        })
        .on('finish', async () => {
          openApiRecord.status = 1
          openApiRecord.endTime = new Date()
          openApiRecord.duration = openApiRecord.endTime - openApiRecord.startTime
          await openApiRecord.save()
        })
    } catch (error) {
      // 断开传输流
      filestream.close()
      openApiRecord.status = 2
      await openApiRecord.save()
      await downloadErrorHandler(error, req.ip)
    }
  } catch (error) {
    await errorHandler(error, req, res)
  }
})

// TODO: 开放 API 进行音频转码任务

module.exports = router
