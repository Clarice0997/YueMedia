// import modules
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { generateJsonWebToken } = require('../utils/Jwt')
const mime = require('mime')
const fs = require('fs')
const { OpenApiRecord } = require('../models/openApiRecordModel')
const path = require('path')

/**
 * 获取开放 API Token Service
 * @param userData
 * @param endDate
 * @returns
 */
const getOpenApiTokenService = async (userData, endDate) => {
  try {
    let maxAge
    // 不存在过期时间则采用默认过期时间（一天）
    if (endDate) {
      let nowDate = new Date()
      maxAge = new Date(endDate) - nowDate
    } else {
      maxAge = 60 * 60 * 24
    }
    // 生成开放 API Token
    const openApiToken = await generateJsonWebToken(
      {
        uno: userData.uno,
        username: userData.username
      },
      process.env.OPEN_JWT_KEY,
      +maxAge
    )
    // 返回数据
    return {
      data: {
        message: '开放 API Token 生成成功',
        token: openApiToken
      },
      code: 200
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
 * 开放 API 获取私有音频文件 Service
 * @param musicPath
 * @param req
 * @returns
 */
const getPrivateMusicOpenapiService = async (musicPath, req) => {
  try {
    // 拼接文件链接
    const concatFilePath = path.join(process.env.DEFAULT_STATIC_PATH, process.env.MUSIC_FOLDER, req.authorization.uno, musicPath)
    // 确保文件存在
    if (!fs.existsSync(concatFilePath)) {
      return {
        code: 400,
        data: {
          message: '文件不存在'
        }
      }
    }
    // 获取文件名
    const filename = path.basename(concatFilePath)
    const mimetype = mime.getType(concatFilePath)

    // 开放 API 调用记录
    const openApiRecord = new OpenApiRecord({
      public: false,
      userId: req.authorization.uno,
      ip: req.ip,
      path: musicPath,
      type: 'Get Private Music API',
      fileSize: fs.statSync(concatFilePath).size,
      startTime: new Date()
    })
    await openApiRecord.save()

    return {
      filename,
      mimetype,
      openApiRecord,
      concatFilePath
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
 * 开放 API 获取公开音频文件 Service
 * @param musicPath
 * @param req
 * @returns
 */
const getMusicOpenapiService = async (musicPath, req) => {
  try {
    // 拼接文件链接
    const concatFilePath = path.join(process.env.DEFAULT_STATIC_PATH, process.env.OPENAPI_FOLDER, musicPath)
    // 确保文件存在
    if (!fs.existsSync(concatFilePath)) {
      return {
        code: 400,
        data: {
          message: '文件不存在'
        }
      }
    }
    // 获取文件名
    const filename = path.basename(concatFilePath)
    const mimetype = mime.getType(concatFilePath)

    // 开放 API 调用记录
    const openApiRecord = new OpenApiRecord({
      public: true,
      ip: req.ip,
      userId: musicPath.split('\\').shift(),
      path: musicPath,
      type: 'Get Open Music API',
      fileSize: fs.statSync(concatFilePath).size,
      startTime: new Date()
    })
    await openApiRecord.save()

    return {
      filename,
      mimetype,
      openApiRecord,
      concatFilePath
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
 * 开放 API 获取私有视频文件 Service
 * @param videoPath
 * @param req
 * @returns
 */
const getPrivateVideoOpenapiService = async (videoPath, req) => {
  try {
    // 拼接文件链接
    const concatFilePath = path.join(process.env.DEFAULT_STATIC_PATH, process.env.VIDEO_FOLDER, req.authorization.uno, videoPath)
    // 确保文件存在
    if (!fs.existsSync(concatFilePath)) {
      return {
        code: 400,
        data: {
          message: '文件不存在'
        }
      }
    }
    // 获取文件名
    const filename = path.basename(concatFilePath)
    const mimetype = mime.getType(concatFilePath)

    // 开放 API 调用记录
    const openApiRecord = new OpenApiRecord({
      public: false,
      userId: req.authorization.uno,
      ip: req.ip,
      path: videoPath,
      type: 'Get Private Video API',
      fileSize: fs.statSync(concatFilePath).size,
      startTime: new Date()
    })
    await openApiRecord.save()

    return {
      filename,
      mimetype,
      openApiRecord,
      concatFilePath
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
 * 开放 API 获取公开视频文件 Service
 * @param videoPath
 * @param req
 * @returns
 */
const getVideoOpenapiService = async (videoPath, req) => {
  try {
    // 拼接文件链接
    const concatFilePath = path.join(process.env.DEFAULT_STATIC_PATH, process.env.OPENAPI_FOLDER, videoPath)
    // 确保文件存在
    if (!fs.existsSync(concatFilePath)) {
      return {
        code: 400,
        data: {
          message: '文件不存在'
        }
      }
    }
    // 获取文件名
    const filename = path.basename(concatFilePath)
    const mimetype = mime.getType(concatFilePath)

    // 开放 API 调用记录
    const openApiRecord = new OpenApiRecord({
      public: true,
      ip: req.ip,
      path: videoPath,
      userId: videoPath.split('\\').shift(),
      type: 'Get Open Video API',
      fileSize: fs.statSync(concatFilePath).size,
      startTime: new Date()
    })
    await openApiRecord.save()

    return {
      filename,
      mimetype,
      openApiRecord,
      concatFilePath
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

module.exports = {
  getOpenApiTokenService,
  getPrivateMusicOpenapiService,
  getMusicOpenapiService,
  getVideoOpenapiService,
  getPrivateVideoOpenapiService
}
