// import modules
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { generateMD5 } = require('../utils/MD5')
const path = require('path')
const fs = require('fs')
const mm = require('music-metadata')
const { mysqlHandler } = require('../config/mysql')
const { rpushRedis, hgetRedis } = require('../utils/redis/RedisHandler')
const { insertAudioConvertQueues } = require('../models/audioConvertQueueModel')

// 文件夹常量
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const TEMP_PARSE_MUSIC_FOLDER = process.env.TEMP_PARSE_MUSIC_FOLDER
const MUSIC_FOLDER = process.env.MUSIC_FOLDER

/**
 * 文件分析 Service
 * @param file
 * @returns
 */
const analyseFileService = async file => {
  try {
    const { originalname, encoding, mimetype, size } = file
    // 音乐文件获取元数据
    if (mimetype.split('/').shift() === 'audio') {
      const metadata = await mm.parseBuffer(file.buffer)
      return {
        code: 200,
        data: {
          originalname,
          encoding,
          mimetype,
          size,
          format: metadata.format,
          common: { ...metadata.common, picture: undefined }
        }
      }
    } else {
      return {
        code: 200,
        data: { originalname, encoding, mimetype, size }
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
 * 上传转码音乐文件 Service
 * @param files
 * @param [fileNames]
 * @returns
 */
const uploadConvertMusicService = async (files, fileNames) => {
  try {
    let filesDetail = []
    if (fileNames) fileNames = JSON.parse(fileNames)
    // 循环待转码文件 存入待转码文件夹
    for (let i = 0; i < files.length; i++) {
      // 根据音乐文件生成 MD5
      const musicMD5 = await generateMD5(files[i].buffer)
      // 获取音乐文件元数据
      const metadata = await mm.parseBuffer(files[i].buffer)
      // 定义音乐保存名
      const musicName = musicMD5 + Date.now()
      // 生成待解析音乐文件存储地址
      const musicFileName = musicName + path.extname(files[i].originalname)
      const musicPath = path.join(DEFAULT_STATIC_PATH, TEMP_PARSE_MUSIC_FOLDER, musicFileName)
      // 临时存储待解析音乐文件
      fs.writeFileSync(musicPath, files[i].buffer)
      // 存储上传转码音乐文件信息
      filesDetail.push({
        originalName: fileNames ? fileNames[i] : files[i].originalname,
        status: 1,
        encoding: files[i].encoding,
        mimetype: files[i].mimetype,
        container: metadata.format.container,
        codec: metadata.format.codec,
        size: files[i].size,
        musicFileName
      })
    }
    return {
      code: 200,
      data: { filesDetail }
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
 * 上传我的音频 Service
 * @param filesData
 * @param uno
 * @returns
 */
const uploadMyFileConvertMusicService = async (filesData, uno) => {
  try {
    // 参数校验
    if (!filesData) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }
    let filesDetail = []
    // 循环待转码文件 存入待转码文件夹
    for (let i = 0; i < filesData.length; i++) {
      const originMusicPath = path.join(DEFAULT_STATIC_PATH, MUSIC_FOLDER, uno, filesData[i].origin_file_name)
      const musicPath = path.join(DEFAULT_STATIC_PATH, TEMP_PARSE_MUSIC_FOLDER, filesData[i].origin_file_name)
      // 存储待解析音乐文件
      fs.copyFileSync(originMusicPath, musicPath)
      // 存储上传转码音乐文件信息
      filesDetail.push({
        originalName: filesData[i].song_name,
        status: 1,
        codec: filesData[i].music_codec,
        size: filesData[i].song_size,
        musicFileName: filesData[i].origin_file_name
      })
    }
    return {
      code: 200,
      data: { filesDetail }
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
 * 删除待转码音乐文件 Service
 * @param targetFile
 * @returns
 */
const deleteConvertMusicService = async targetFile => {
  try {
    // 数据校验
    if (!targetFile) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }
    // 删除临时代转换音乐文件
    const targetFilePath = path.join(DEFAULT_STATIC_PATH, TEMP_PARSE_MUSIC_FOLDER, targetFile)
    // 判断文件是否存在再删除
    if (fs.existsSync(targetFilePath)) {
      fs.unlinkSync(targetFilePath)
    } else {
      return {
        code: 404,
        data: {
          message: '临时文件不存在'
        }
      }
    }

    // success
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
 * 获取支持音乐格式 Service
 * @returns
 */
const getSupportMusicCodecService = async () => {
  try {
    // 查询数据
    const supportMusicCodec = await mysqlHandler('select * from music_codec')

    // success
    return {
      code: 200,
      data: { supportMusicCodec }
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
 * 提交音频转码任务 Service
 * @param tasks
 * @param user
 * @returns
 */
const submitMusicConvertTaskService = async (tasks, user) => {
  try {
    // 判断参数是否合法
    if (!tasks) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }
    // 判断文件是否存在
    if (!tasks.every(task => fs.existsSync(path.join(DEFAULT_STATIC_PATH, TEMP_PARSE_MUSIC_FOLDER, task.musicFileName)))) {
      return {
        code: 400,
        data: {
          message: '文件不存在'
        }
      }
    }
    // 生成唯一的任务 id
    const taskId = `${user.uno}-${Date.now()}`
    // 插入 Redis 任务队列
    await rpushRedis('music_convert_tasks', JSON.stringify({ task: { taskId, createTime: Date.now(), tasks } }))
    await insertAudioConvertQueues(taskId, tasks, user.uno)
    return {
      code: 200,
      data: { task: { taskId, tasks } }
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
 * 获取音频转码统计数据 Service
 * @returns
 */
const getMusicConvertAnalyseService = async () => {
  try {
    // 从 Redis 中取出音频转码统计数据缓存
    const totalMusicConvertRecord = JSON.parse(await hgetRedis('calculator', 'total_music_convert_record'))
    return {
      code: 200,
      data: {
        totalMusicConvertRecord
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

module.exports = {
  analyseFileService,
  uploadConvertMusicService,
  deleteConvertMusicService,
  getSupportMusicCodecService,
  submitMusicConvertTaskService,
  getMusicConvertAnalyseService,
  uploadMyFileConvertMusicService
}
