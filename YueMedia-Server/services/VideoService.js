// import modules
const { generateMD5 } = require('../utils/MD5')
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const { spawnSync } = require('child_process')
const ffmpegError = require('../utils/ffmpegError')
const { mysqlHandler } = require('../config/mysql')
const { removeVideoPromise } = require('../utils/removeVideoPromise')
const { dirCompressing } = require('../utils/dirCompressing')
const { calculateUserUsedStorage } = require('../utils/redis/calculator/calculateUserUsedStorage')

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

    await calculateUserUsedStorage(userData.uno)

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

/**
 * 获取个人视频列表、视频数量 Service
 * @param pageNumber
 * @param pageSize
 * @param uno
 * @returns
 */
const selectVideoListService = async (pageNumber, pageSize, uno) => {
  try {
    // 判断是否存在页码
    if (typeof pageNumber == 'undefined') {
      pageNumber = 1
    }
    // 判断是否存在页面条数限制
    if (typeof pageSize == 'undefined') {
      pageSize = 10
    }
    if (pageNumber <= 0 || pageSize <= 0 || !/\d+/gi.test(pageNumber) || !/\d+/gi.test(pageSize)) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }

    // 查询数据条数
    const [{ count }] = await mysqlHandler('select count(*) count from video where upload_by = ?', [uno])

    // 判断是否存在上传视频数据
    if (count === 0) {
      return {
        code: 200,
        data: {
          message: '不存在上传视频数据',
          count: 0
        }
      }
    }

    // 判断查询数据是否超出范围
    if (pageNumber * pageSize - pageSize >= count) {
      return {
        code: 200,
        data: {
          message: '数据超出范围',
          count
        }
      }
    }

    // 查询视频数据
    const videoData = await mysqlHandler('select * from video where upload_by = ? limit ?,?', [uno, (pageNumber - 1) * pageSize, Number(pageSize)])
    // 查询编码格式
    const codecData = await mysqlHandler('select * from video_codec')
    // 处理返回数据
    const filterVideoData = videoData.map(video => {
      let filterVideo = video
      let targetCodec = codecData.find(codec => codec.id === filterVideo['video_codec'])
      filterVideo['video_codec'] = targetCodec.codec
      filterVideo['mimetype'] = targetCodec.mimetype
      filterVideo['extname'] = targetCodec.extname
      filterVideo['open_path'] = video.status === 1 ? '' : path.join(uno, video.video_file_name)
      return filterVideo
    })

    // Return
    return {
      code: 200,
      data: { videoData: filterVideoData, count }
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
 * 下载视频文件 Service
 * @param videoData
 * @param userData
 * @returns
 */
const downloadVideoService = async (videoData, userData) => {
  try {
    // 判断视频数据是否为空
    if (!videoData) {
      return {
        code: 400,
        data: {
          message: '视频数据不能为空'
        }
      }
    }
    // 获取视频文件路径
    const filePath = path.join(DEFAULT_STATIC_PATH, VIDEO_FOLDER, userData.uno, videoData.video_file_name)
    // 判断视频文件是否存在
    if (!fs.existsSync(filePath)) {
      return {
        code: 400,
        data: {
          message: '视频文件不存在！'
        }
      }
    }
    // 确保用户下载文件夹存在
    const userDownloadPath = path.join(DEFAULT_STATIC_PATH, DOWNLOAD_FOLDER, userData.uno)
    fse.ensureDirSync(userDownloadPath, {})
    // 复制视频文件到缓冲区文件夹中
    const fileName = `${videoData.video_name}_${Date.now() + path.extname(videoData.video_file_name)}`
    fs.copyFileSync(filePath, path.join(userDownloadPath, fileName))

    return {
      code: 200,
      data: {
        message: '文件已加载到缓冲区',
        downloadPath: path.join(userData.uno, fileName)
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
 * 开始播放视频 Service
 * @param videoData
 * @param userData
 * @returns
 */
const startPlayVideoService = async (videoData, userData) => {
  try {
    // 判断视频数据是否为空
    if (!videoData) {
      return {
        code: 400,
        data: {
          message: '视频数据不能为空'
        }
      }
    }
    // 判断视频文件是否存在
    const videoFilePath = path.join(DEFAULT_STATIC_PATH, VIDEO_FOLDER, userData.uno, videoData.video_file_name)
    if (!fs.existsSync(videoFilePath)) {
      return {
        code: 400,
        data: {
          message: '视频文件不存在！'
        }
      }
    }
    return {
      code: 200,
      data: {
        title: videoData.video_name,
        cover: videoData.video_cover_file_name,
        src: videoData.video_file_name,
        message: '获取视频播放数据成功！'
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
 * 修改视频开放状态 Service
 * @param videoData
 * @param userData
 * @returns
 */
const updateVideoStatusService = async (videoData, userData) => {
  try {
    // 判断视频数据是否为空
    if (!videoData) {
      return {
        code: 400,
        data: {
          message: '视频数据不能为空'
        }
      }
    }
    // 查询视频文件原先开放状态
    const [originVideoData] = await mysqlHandler('select * from video where id = ?', [videoData.id])

    if (originVideoData.status === 1) {
      if (videoData.status === 1) {
        return {
          code: 200,
          data: {
            message: '视频状态无需修改'
          }
        }
      } else {
        fse.copySync(path.join(DEFAULT_STATIC_PATH, VIDEO_FOLDER, userData.uno, videoData.video_file_name), path.join(DEFAULT_STATIC_PATH, OPENAPI_FOLDER, userData.uno, videoData.video_file_name))
        await mysqlHandler('update video set status = ? where id = ?', [videoData.status, videoData.id])
      }
    } else {
      if (videoData.status === 2) {
        return {
          code: 200,
          data: {
            message: '视频状态无需修改'
          }
        }
      } else {
        fs.unlinkSync(path.join(DEFAULT_STATIC_PATH, OPENAPI_FOLDER, userData.uno, videoData.video_file_name))
        await mysqlHandler('update video set status = ? where id = ?', [videoData.status, videoData.id])
      }
    }

    return {
      code: 200,
      data: {
        message: '修改视频状态成功'
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
 * 删除视频 Service
 * @param videoData
 * @param userData
 * @returns
 */
const deleteVideoService = async (videoData, userData) => {
  try {
    // 判断视频数据是否为空
    if (!videoData) {
      return {
        code: 400,
        data: {
          message: '视频数据不能为空'
        }
      }
    }

    await removeVideoPromise(videoData, userData)

    await calculateUserUsedStorage(userData.uno)

    return {
      code: 200,
      data: {
        message: '删除视频文件成功'
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
 * 批量下载视频文件 Service
 * @param fileList
 * @param userData
 * @returns
 */
const downloadVideoBatchService = async (fileList, userData) => {
  try {
    // 判断文件列表是否为空
    if (!fileList) {
      return {
        code: 400,
        data: {
          message: '文件列表不能为空'
        }
      }
    }
    // 获取视频文件路径
    const filePaths = fileList.map(file => {
      return path.join(DEFAULT_STATIC_PATH, VIDEO_FOLDER, userData.uno, file.video_file_name)
    })
    // 判断视频文件是否存在
    if (!filePaths.every(filePath => fs.existsSync(filePath))) {
      return {
        code: 400,
        data: {
          message: '文件不存在！'
        }
      }
    }
    // 创建下载缓冲区文件夹
    const DownloadId = `${userData.uno}_${Date.now()}`
    const DownloadFolderPath = path.join(DEFAULT_STATIC_PATH, DOWNLOAD_FOLDER, userData.uno, DownloadId)
    fse.ensureDirSync(DownloadFolderPath, {})
    // 复制视频文件到指定缓冲区文件夹中
    filePaths.forEach(filePath => fs.copyFileSync(filePath, path.join(DownloadFolderPath, filePath.split('\\').pop())))
    // 压缩文件夹 获取文件夹路径
    const outputDownloadFolderPath = path.join(DEFAULT_STATIC_PATH, DOWNLOAD_FOLDER, userData.uno, `${DownloadId}.zip`)
    await dirCompressing(DownloadFolderPath, outputDownloadFolderPath, 'zip')
    // 删除文件夹
    fse.removeSync(DownloadFolderPath)

    return {
      code: 200,
      data: {
        message: '文件打包成功！',
        downloadPath: path.join(userData.uno, `${DownloadId}.zip`)
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
 * 批量删除视频 Service
 * @param fileList
 * @param userData
 * @returns
 */
const deleteVideoBatchService = async (fileList, userData) => {
  try {
    // 判断文件列表是否为空
    if (!fileList) {
      return {
        code: 400,
        data: {
          message: '文件列表不能为空'
        }
      }
    }
    const videoFilePromiseArr = []
    fileList.forEach(file => {
      videoFilePromiseArr.push(removeVideoPromise(file, userData))
    })

    await Promise.all(videoFilePromiseArr)

    await calculateUserUsedStorage(userData.uno)

    return {
      code: 200,
      data: {
        message: '批量删除文件成功！'
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
 * 获取支持视频格式 Service
 * @returns
 */
const getSupportVideoCodecService = async () => {
  try {
    // 查询数据
    const supportVideoCodec = await mysqlHandler('select * from video_codec')

    // success
    return {
      code: 200,
      data: { supportVideoCodec }
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
  uploadVideoService,
  uploadVideoCoverService,
  uploadVideoDataService,
  deleteTempVideoService,
  selectVideoListService,
  downloadVideoService,
  startPlayVideoService,
  updateVideoStatusService,
  deleteVideoService,
  downloadVideoBatchService,
  deleteVideoBatchService,
  getSupportVideoCodecService
}
