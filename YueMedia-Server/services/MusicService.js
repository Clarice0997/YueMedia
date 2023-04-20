// import modules
const path = require('path')
const fs = require('fs')
const { generateMD5 } = require('../utils/MD5.js')
const mm = require('music-metadata')
const { mysqlHandler } = require('../config/mysql')
const ffmpegError = require('../utils/ffmpegError')
const { spawnSync } = require('child_process')
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { ncmCracker } = require('../utils/music/ncmCracker')
const { audioConvertRecord } = require('../models/audioConvertRecordModel')

// 存储文件位置常量
const TEMP_MUSIC_FOLDER = process.env.TEMP_MUSIC_FOLDER
const TEMP_COVER_FOLDER = process.env.TEMP_COVER_FOLDER
const PLAY_MUSIC_FOLDER = process.env.PLAY_MUSIC_FOLDER
const MUSIC_FOLDER = process.env.MUSIC_FOLDER
const COVER_FOLDER = process.env.COVER_FOLDER
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const TEMP_PLAY_MUSIC_FOLDER = process.env.TEMP_PLAY_MUSIC_FOLDER

/**
 * 上传音乐文件
 * @param musicFile
 * @param mimetype
 * @returns
 */
const uploadMusicService = async (musicFile, mimetype) => {
  try {
    // 根据音乐文件生成 MD5
    const musicMD5 = await generateMD5(musicFile.buffer)
    // 定义音乐保存名
    const musicName = musicMD5 + Date.now()
    // TODO: 文件存储位置改变 每个用户单独一个文件夹
    // TODO: 需要判断文件夹是否存在，没有则创建新的文件夹
    // NCM 格式处理
    if (mimetype === 'application/octet-stream') {
      // 解码 NCM
      const ncmData = await ncmCracker(musicFile, musicName)
      // 解码错误返回
      if (ncmData.code) {
        return {
          code: ncmData.code,
          data: {
            message: ncmData.data.message
          }
        }
      }
      const { musicFileName, mp3Buffer, originFilePath } = ncmData
      // 获取音乐文件元数据
      const metadata = await mm.parseBuffer(mp3Buffer)
      // 判断音乐封面是否存在
      let coverData
      let musicCoverName = `${musicName}.jpg`
      // 音乐封面存在存储音乐封面 如果不存在则采用默认音乐封面
      if (metadata.common.picture) {
        if (metadata.common.picture.length > 0) {
          // 获取音乐封面图
          coverData = metadata.common.picture[0].data
          // 生成音乐封面存储地址
          const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverName)
          // 临时存储音乐封面
          fs.writeFileSync(coverPath, coverData)
        }
      } else {
        // 生成音乐封面存储地址
        const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverName)
        // 临时存储音乐封面
        fs.copyFileSync(path.join(__dirname, '..', 'public', 'cover.jpg'), coverPath)
      }
      // 存储临时播放文件
      const tempPlayFilePath = path.join(DEFAULT_STATIC_PATH, TEMP_PLAY_MUSIC_FOLDER, `${musicName}.mp3`)
      if (metadata.format.container === 'MPEG') {
        // 编码格式为 MPEG 直接复制文件
        fs.copyFileSync(originFilePath, tempPlayFilePath)
      } else {
        // 编码格式不为 MPEG 转码文件
        // 异步进程转码同步
        let startTime, endTime
        startTime = new Date()
        const result = spawnSync('ffmpeg', ['-i', originFilePath, '-c:a', 'libmp3lame', tempPlayFilePath])
        // 等待转码结束判断是否成功 标准输出流和错误输出流
        if (result.status === 0) {
          endTime = new Date()
          audioConvertRecord(musicName, 'uploadMusicService', metadata.format.container, 'MPEG', endTime - startTime)
        } else {
          throw new ffmpegError(result.stderr.toString('utf8'))
        }
      }
      // 返回成功消息对象
      return {
        code: 200,
        data: {
          meta: {
            ...metadata.common,
            comment: undefined,
            picture: undefined,
            track: undefined,
            disk: undefined,
            movementIndex: undefined,
            encodersettings: undefined,
            codec: metadata.format.codec,
            size: musicFile.buffer.length
          },
          songId: musicName,
          coverName: musicCoverName,
          musicName: musicFileName
        }
      }
    } else {
      // 获取音乐文件元数据
      const metadata = await mm.parseBuffer(musicFile.buffer)
      // 判断音乐封面是否存在
      let coverData
      let musicCoverName = `${musicName}.jpg`
      // 音乐封面存在存储音乐封面 如果不存在则采用默认音乐封面
      if (metadata.common.picture) {
        if (metadata.common.picture.length > 0) {
          // 获取音乐封面图
          coverData = metadata.common.picture[0].data
          // 生成音乐封面存储地址
          const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverName)
          // 临时存储音乐封面
          fs.writeFileSync(coverPath, coverData)
        }
      } else {
        // 生成音乐封面存储地址
        const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverName)
        // 临时存储音乐封面
        fs.copyFileSync(path.join(__dirname, '..', 'public', 'cover.jpg'), coverPath)
      }
      // 生成音乐文件存储地址
      const musicFileName = musicName + path.extname(musicFile.originalname)
      const musicPath = path.join(DEFAULT_STATIC_PATH, TEMP_MUSIC_FOLDER, musicFileName)
      // 临时存储音乐文件
      fs.writeFileSync(musicPath, musicFile.buffer)
      // 存储临时播放文件
      const tempPlayFilePath = path.join(DEFAULT_STATIC_PATH, TEMP_PLAY_MUSIC_FOLDER, `${musicName}.mp3`)
      if (metadata.format.container === 'MPEG') {
        // 编码格式为 MPEG 直接复制文件
        fs.copyFileSync(musicPath, tempPlayFilePath)
      } else {
        // 编码格式不为 MPEG 转码文件
        // 异步进程转码同步
        let startTime, endTime
        startTime = new Date()
        const result = spawnSync('ffmpeg', ['-i', musicPath, '-c:a', 'libmp3lame', tempPlayFilePath])
        // 等待转码结束判断是否成功 标准输出流和错误输出流
        if (result.status === 0) {
          endTime = new Date()
          audioConvertRecord(musicName, 'uploadMusicService', metadata.format.container, 'MPEG 1 Layer 3', endTime - startTime)
        } else {
          throw new ffmpegError(result.stderr.toString('utf8'))
        }
      }
      // 返回成功消息对象
      return {
        code: 200,
        data: {
          meta: {
            ...metadata.common,
            comment: undefined,
            picture: undefined,
            track: undefined,
            disk: undefined,
            movementIndex: undefined,
            encodersettings: undefined,
            codec: metadata.format.codec,
            size: musicFile.buffer.length
          },
          songId: musicName,
          coverName: musicCoverName,
          musicName: musicFileName
        }
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
 * 上传音乐封面
 * @param musicCoverFile
 * @param musicName
 * @param originCoverName
 * @returns {Promise<{code: number, data: {message: string, picture: string}}|{code: number, data: {message}}>}
 */
const uploadMusicCoverService = async (musicCoverFile, musicName, originCoverName) => {
  try {
    // 判断参数是否齐全
    if (!(musicName && originCoverName)) {
      return {
        code: 400,
        data: {
          message: '上传封面参数不合法'
        }
      }
    }
    // 删除原封面文件
    const originCoverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, originCoverName)
    fs.unlinkSync(originCoverPath)
    // 将新音乐封面文件写入临时文件夹
    const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, `${musicName}${path.extname(musicCoverFile.originalname)}`)
    fs.writeFileSync(coverPath, musicCoverFile.buffer)
    // 返回成功消息对象
    return {
      code: 200,
      data: {
        message: '封面图片上传成功',
        picture: `${musicName}${path.extname(musicCoverFile.originalname)}`
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
 * 上传音乐数据
 * @param data
 * @param userData
 * @returns
 */
const uploadMusicDataService = async (data, userData) => {
  try {
    // 获取音乐数据上传所需参数
    let { songId, songName, songSize, musicCodec, musicCoverFileName, musicFileName, singerName, albumName, year } = data
    // 判断参数是否齐全
    if (!(songId && songName && songSize && musicCodec && musicCoverFileName && musicFileName)) {
      return {
        code: 400,
        data: {
          message: '音乐数据上传参数不合法'
        }
      }
    }
    // 判断文件是否存在
    if (!fs.existsSync(path.join(DEFAULT_STATIC_PATH, TEMP_MUSIC_FOLDER, musicFileName))) {
      return {
        code: 400,
        data: {
          message: '音乐文件不存在'
        }
      }
    }
    // TODO: 文件存储位置改变 每个用户单独一个文件夹
    // TODO: 需要判断文件夹是否存在，没有则创建新的文件夹
    // 判断音乐文件是否需要转码 供播放使用
    let playFileName = `${songId}.mp3`
    const inputPath = path.join(DEFAULT_STATIC_PATH, TEMP_PLAY_MUSIC_FOLDER, playFileName)
    const outputPath = path.join(DEFAULT_STATIC_PATH, PLAY_MUSIC_FOLDER, playFileName)
    // 复制文件到播放文件夹
    fs.copyFileSync(inputPath, outputPath)

    // 持久化临时文件夹中的临时音乐文件和音乐封面
    // 剪切临时音乐文件夹中的音乐文件到持久化音乐文件夹
    fs.renameSync(path.join(DEFAULT_STATIC_PATH, TEMP_MUSIC_FOLDER, musicFileName), path.join(DEFAULT_STATIC_PATH, MUSIC_FOLDER, musicFileName))
    // 剪切临时音乐封面文件夹中的音乐封面到持久化音乐封面文件夹
    fs.renameSync(path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverFileName), path.join(DEFAULT_STATIC_PATH, COVER_FOLDER, musicCoverFileName))

    // 准备数据 插入数据库
    // 查询数据库编码类型
    const codecData = await mysqlHandler(`select id from music_codec where codec = ?`, [musicCodec])
    const codecId = codecData[0].id

    // 插入音乐表
    const query = 'insert into music(song_id,upload_by,song_name,song_size,music_codec,play_file_name,music_cover_file_name,origin_file_name,singer_name,album_name,year) values(?,?,?,?,?,?,?,?,?,?,?)'
    const params = [songId, userData.uno, songName, songSize, codecId, playFileName, musicCoverFileName, musicFileName, singerName ? singerName : null, albumName ? albumName : null, year ? year : null]
    await mysqlHandler(query, params)

    return {
      code: 200,
      data: {
        message: '插入音乐数据成功'
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
 * 删除临时音乐文件数据
 * @param musicName
 * @param coverName
 * @returns {Promise<{code: number, data: {message}}|{code: number, data: {message: string}}>}
 */
const deleteTempMusicService = async (musicName, coverName) => {
  try {
    // 数据校验
    if (!(musicName && coverName)) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }
    // 删除临时音乐文件和临时封面文件
    const tempMusicFile = path.join(DEFAULT_STATIC_PATH, TEMP_MUSIC_FOLDER, musicName)
    const tempCoverFile = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, coverName)
    // 判断文件是否存在再删除
    if (fs.existsSync(tempMusicFile) && fs.existsSync(tempCoverFile)) {
      fs.unlinkSync(tempMusicFile)
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
 * 获取个人音乐列表、音乐数量 Service
 * @param pageNumber
 * @param pageSize
 * @param uno
 * @returns {Promise<{code: number, data: {count: number, message: string}}|{code: number, data: {count: *, message: string}}|{code: number, data: {message: string}}|{code: number, data: {message}}|{code: number, data: {musicData: unknown, count: *}}>}
 */
const selectMusicListService = async (pageNumber, pageSize, uno) => {
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
    const [{ count }] = await mysqlHandler('select count(*) count from music where upload_by = ?', [uno])

    // 判断是否存在上传音乐数据
    if (count === 0) {
      return {
        code: 200,
        data: {
          message: '不存在上传音乐数据',
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

    // 查询数据
    const musicData = await mysqlHandler('select * from music where upload_by = ? limit ?,?', [uno, (pageNumber - 1) * pageSize, Number(pageSize)])

    // Return
    return {
      code: 200,
      data: { musicData, count }
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
  uploadMusicService,
  uploadMusicCoverService,
  uploadMusicDataService,
  deleteTempMusicService,
  selectMusicListService
}