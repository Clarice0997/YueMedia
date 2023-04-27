// import modules
const { generateMD5 } = require('../utils/MD5')
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const { spawnSync } = require('child_process')
const ffmpegError = require('../utils/ffmpegError')
const { mysqlHandler } = require('../config/mysql')

// 存储文件位置常量
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const TEMP_VIDEO_FOLDER = process.env.TEMP_VIDEO_FOLDER
const TEMP_VIDEO_COVER_FOLDER = process.env.TEMP_VIDEO_COVER_FOLDER
const VIDEO_FOLDER = process.env.VIDEO_FOLDER
const VIDEO_COVER_FOLDER = process.env.VIDEO_COVER_FOLDER
const DOWNLOAD_FOLDER = process.env.DOWNLOAD_FOLDER
const OPENAPI_FOLDER = process.env.OPENAPI_FOLDER

/**
 * 上传视频文件 Service
 * @param videoFile
 * @param mimetype
 * @returns
 */
const uploadVideoService = async (videoFile, mimetype) => {
  try {
    // 根据视频文件生成 MD5
    const videoMD5 = await generateMD5(videoFile.buffer)
    // 定义视频 ID 视频标题 临时视频存储文件名 临时视频封面存储文件名
    const videoId = videoMD5 + Date.now()
    const videoFileName = videoId + path.extname(videoFile.originalname)
    const videoCoverFileName = `${videoId}.jpg`
    // 临时存储视频文件 获取存储地址
    const tempVideoFilePath = path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_FOLDER, videoFileName)
    fs.writeFileSync(tempVideoFilePath, videoFile.buffer)
    // 获取封面图片 存储到临时视频封面文件夹中
    const tempVideoCoverFilePath = path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_COVER_FOLDER, videoCoverFileName)
    const result = spawnSync('ffmpeg', ['-i', tempVideoFilePath, '-vframes', '1', '-q:v', '2', tempVideoCoverFilePath])
    // 截取封面图失败抛错
    if (result.status !== 0) {
      throw new ffmpegError(result.stderr.toString('utf8'))
    }
    // 返回数据
    return {
      code: 200,
      data: {
        videoId,
        videoFileName,
        videoCoverFileName,
        mimetype,
        videoSize: videoFile.buffer.length
      }
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
 * 上传视频封面 Service
 * @param videoCoverFile
 * @param videoId
 * @param videoCoverFileName
 * @returns
 */
const uploadVideoCoverService = async (videoCoverFile, videoId, videoCoverFileName) => {
  try {
    // 判断参数是否齐全
    if (!(videoId && videoCoverFileName)) {
      return {
        code: 400,
        data: {
          message: '上传封面参数不合法'
        }
      }
    }
    // 删除原封面文件
    const originCoverPath = path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_COVER_FOLDER, videoCoverFileName)
    // 将新封面文件写入临时文件夹
    const newVideoCoverFileName = `${path.parse(videoCoverFileName).name + path.extname(videoCoverFile.originalname)}`
    const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_COVER_FOLDER, newVideoCoverFileName)
    fs.unlinkSync(originCoverPath)
    fs.writeFileSync(coverPath, videoCoverFile.buffer)
    // 返回成功消息对象
    return {
      code: 200,
      data: {
        message: '封面图片上传成功',
        videoCoverFileName: newVideoCoverFileName
      }
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
 * 上传视频数据 Service
 * @param videoData
 * @param userData
 * @returns
 */
const uploadVideoDataService = async (videoData, userData) => {
  try {
    // 判断参数是否齐全
    if (!videoData) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }
    // 判断视频文件和封面文件是否存在
    if (!(fs.existsSync(path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_COVER_FOLDER, videoData.videoCoverFileName)) && fs.existsSync(path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_FOLDER, videoData.videoFileName)))) {
      return {
        code: 400,
        data: {
          message: '文件不存在'
        }
      }
    }
    // 判断用户文件夹是否存在，没有则创建文件夹
    const userVideoFileDir = path.join(DEFAULT_STATIC_PATH, VIDEO_FOLDER, userData.uno)
    const userVideoCoverFileDir = path.join(DEFAULT_STATIC_PATH, VIDEO_COVER_FOLDER, userData.uno)
    fse.ensureDirSync(userVideoFileDir, {}) && fse.ensureDirSync(userVideoCoverFileDir, {})

    // 持久化临时文件夹中的临时视频文件和临时视频封面文件
    fse.moveSync(path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_FOLDER, videoData.videoFileName), path.join(userVideoFileDir, videoData.videoFileName))
    fse.moveSync(path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_COVER_FOLDER, videoData.videoCoverFileName), path.join(userVideoCoverFileDir, videoData.videoCoverFileName))

    // 准备数据 插入数据库
    // 查询数据库 视频编码类型
    const codecData = await mysqlHandler(`select id from video_codec where mimetype = ?`, [videoData.mimetype])
    const codecId = codecData[0].id

    // 插入视频表
    const query = 'insert into video(video_id,upload_by,video_name,status,video_size,video_codec,video_file_name,video_cover_file_name) values(?,?,?,?,?,?,?,?)'
    const params = [videoData.videoId, userData.uno, videoData.videoName, 1, videoData.videoSize, codecId, videoData.videoFileName, videoData.videoCoverFileName]
    await mysqlHandler(query, params)

    return {
      code: 200,
      data: {
        message: '插入视频数据成功'
      }
    }
  } catch (error) {}
}

/**
 * 删除临时视频文件 Serivce
 * @param videoFileName
 * @param videoCoverFileName
 * @returns
 */
const deleteTempVideoService = async (videoFileName, videoCoverFileName) => {
  try {
    // 数据校验
    if (!(videoFileName && videoCoverFileName)) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }
    // 删除临时视频文件和临时封面文件
    const tempVideoFile = path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_FOLDER, videoFileName)
    const tempCoverFile = path.join(DEFAULT_STATIC_PATH, TEMP_VIDEO_COVER_FOLDER, videoCoverFileName)
    // 判断文件是否存在再删除
    if (fs.existsSync(tempVideoFile) && fs.existsSync(tempCoverFile)) {
      fs.unlinkSync(tempVideoFile)
      fs.unlinkSync(tempCoverFile)
    } else {
      return {
        code: 404,
        data: {
          message: '临时文件不存在'
        }
      }
    }

    return {
      code: 200,
      data: {
        message: '删除临时数据成功'
      }
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

module.exports = { uploadVideoService, uploadVideoCoverService, uploadVideoDataService, deleteTempVideoService }
