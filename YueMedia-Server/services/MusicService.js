// import modules
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const { generateMD5 } = require('../utils/MD5.js')
const mm = require('music-metadata')
const { mysqlHandler } = require('../config/mysql')
const ffmpegError = require('../utils/ffmpegError')
const { spawnSync } = require('child_process')
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { ncmCracker } = require('../utils/music/ncmCracker')
const { audioConvertRecord } = require('../models/audioConvertRecordModel')
const { uploadMusicPromise } = require('../utils/uploadMusicPromise')
const { dirCompressing } = require('../utils/dirCompressing')
const { removeMusicPromise } = require('../utils/removeMusicPromise')
const { calculateUserUsedStorage } = require('../utils/redis/calculator/calculateUserUsedStorage')

// 存储文件位置常量
const TEMP_MUSIC_FOLDER = process.env.TEMP_MUSIC_FOLDER
const TEMP_COVER_FOLDER = process.env.TEMP_COVER_FOLDER
const PLAY_MUSIC_FOLDER = process.env.PLAY_MUSIC_FOLDER
const MUSIC_FOLDER = process.env.MUSIC_FOLDER
const COVER_FOLDER = process.env.COVER_FOLDER
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const TEMP_PLAY_MUSIC_FOLDER = process.env.TEMP_PLAY_MUSIC_FOLDER
const DOWNLOAD_FOLDER = process.env.DOWNLOAD_FOLDER
const OPENAPI_FOLDER = process.env.OPENAPI_FOLDER

/**
 * 上传音频文件 Service
 * @param musicFile
 * @param mimetype
 * @returns
 */
const uploadMusicService = async (musicFile, mimetype) => {
  try {
    // 根据音频文件生成 MD5
    const musicMD5 = await generateMD5(musicFile.buffer)
    // 定义音频保存名
    const musicName = musicMD5 + Date.now()
    // 判断用户音频文件夹是否存在 没有则创建新的文件夹
    if (mimetype === 'application/octet-stream') {
      // NCM 格式处理
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
      // 获取音频文件元数据
      const metadata = await mm.parseBuffer(mp3Buffer)
      // 判断音频封面是否存在
      let coverData
      let musicCoverName = `${musicName}.jpg`
      // 音频封面存在存储音频封面 如果不存在则采用默认音频封面
      if (metadata.common.picture) {
        if (metadata.common.picture.length > 0) {
          // 获取音频封面图
          coverData = metadata.common.picture[0].data
          // 生成音频封面存储地址
          const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverName)
          // 临时存储音频封面
          fs.writeFileSync(coverPath, coverData)
        }
      } else {
        // 生成音频封面存储地址
        const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverName)
        // 临时存储音频封面
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
          audioConvertRecord(musicName, 'uploadMusicService', musicFile.buffer.length, metadata.format.codec, 'MPEG', endTime - startTime)
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
      // 获取音频文件元数据
      const metadata = await mm.parseBuffer(musicFile.buffer)
      // 判断音频封面是否存在
      let coverData
      let musicCoverName = `${musicName}.jpg`
      // 音频封面存在存储音频封面 如果不存在则采用默认音频封面
      if (metadata.common.picture) {
        if (metadata.common.picture.length > 0) {
          // 获取音频封面图
          coverData = metadata.common.picture[0].data
          // 生成音频封面存储地址
          const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverName)
          // 临时存储音频封面
          fs.writeFileSync(coverPath, coverData)
        }
      } else {
        // 生成音频封面存储地址
        const coverPath = path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverName)
        // 临时存储音频封面
        fs.copyFileSync(path.join(__dirname, '..', 'public', 'cover.jpg'), coverPath)
      }
      // 生成音频文件存储地址
      const musicFileName = musicName + path.extname(musicFile.originalname)
      const musicPath = path.join(DEFAULT_STATIC_PATH, TEMP_MUSIC_FOLDER, musicFileName)
      // 临时存储音频文件
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
          audioConvertRecord(musicName, 'uploadMusicService', musicFile.buffer.length, metadata.format.codec, 'MPEG 1 Layer 3', endTime - startTime)
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
 * 上传音频封面 Service
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
    // 将新音频封面文件写入临时文件夹
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
 * 上传音频数据 Service
 * @param data
 * @param userData
 * @returns
 */
const uploadMusicDataService = async (data, userData) => {
  try {
    // 获取音频数据上传所需参数
    let { songId, songName, songSize, musicCodec, musicCoverFileName, musicFileName, singerName, albumName, year } = data
    // 判断参数是否齐全
    if (!(songId && songName && songSize && musicCodec && musicCoverFileName && musicFileName)) {
      return {
        code: 400,
        data: {
          message: '音频数据上传参数不合法'
        }
      }
    }
    // 判断文件是否存在
    if (!fs.existsSync(path.join(DEFAULT_STATIC_PATH, TEMP_MUSIC_FOLDER, musicFileName))) {
      return {
        code: 400,
        data: {
          message: '音频文件不存在'
        }
      }
    }
    // 判断用户文件夹是否存在，没有则创建文件夹
    const userMusicFileDir = path.join(DEFAULT_STATIC_PATH, MUSIC_FOLDER, userData.uno)
    const userPlayMusicFileDir = path.join(DEFAULT_STATIC_PATH, PLAY_MUSIC_FOLDER, userData.uno)
    const userMusicCoverFileDir = path.join(DEFAULT_STATIC_PATH, COVER_FOLDER, userData.uno)
    fse.ensureDirSync(userMusicFileDir, {}) && fse.ensureDirSync(userPlayMusicFileDir, {}) && fse.ensureDirSync(userMusicCoverFileDir, {})

    // 持久化临时文件夹中的临时音频文件、音频封面和临时播放音频文件
    // 移动临时播放音频文件夹中的播放音频文件到持久化播放音频文件夹中
    let playFileName = `${songId}.mp3`
    fse.moveSync(path.join(DEFAULT_STATIC_PATH, TEMP_PLAY_MUSIC_FOLDER, playFileName), path.join(userPlayMusicFileDir, playFileName))
    // 移动临时音频文件夹中的音频文件到持久化音频文件夹
    fse.moveSync(path.join(DEFAULT_STATIC_PATH, TEMP_MUSIC_FOLDER, musicFileName), path.join(userMusicFileDir, musicFileName))
    // 移动临时音频封面文件夹中的音频封面到持久化音频封面文件夹
    fse.moveSync(path.join(DEFAULT_STATIC_PATH, TEMP_COVER_FOLDER, musicCoverFileName), path.join(userMusicCoverFileDir, musicCoverFileName))

    // 准备数据 插入数据库
    // 查询数据库编码类型
    const codecData = await mysqlHandler(`select id from music_codec where codec = ?`, [musicCodec])
    const codecId = codecData[0].id

    // 插入音频表
    const query = 'insert into music(song_id,upload_by,song_name,song_size,music_codec,play_file_name,music_cover_file_name,origin_file_name,singer_name,album_name,year) values(?,?,?,?,?,?,?,?,?,?,?)'
    const params = [songId, userData.uno, songName, songSize, codecId, playFileName, musicCoverFileName, musicFileName, singerName ? singerName : null, albumName ? albumName : null, year ? year : null]
    await mysqlHandler(query, params)

    await calculateUserUsedStorage(userData.uno)

    return {
      code: 200,
      data: {
        message: '插入音频数据成功'
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
 * 删除临时音频文件数据 Service
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
    // 删除临时音频文件和临时封面文件
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
 * 获取个人音频列表、音频数量 Service
 * @param pageNumber
 * @param pageSize
 * @param uno
 * @returns
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

    // 判断是否存在上传音频数据
    if (count === 0) {
      return {
        code: 200,
        data: {
          message: '不存在上传音频数据',
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

    // 查询音频数据
    const musicData = await mysqlHandler('select * from music where upload_by = ? limit ?,?', [uno, (pageNumber - 1) * pageSize, Number(pageSize)])
    // 查询编码格式
    const codecData = await mysqlHandler('select * from music_codec')
    // 处理返回数据
    const filterMusicData = musicData.map(music => {
      let filterMusic = music
      filterMusic['music_codec'] = codecData.find(codec => codec.id === filterMusic['music_codec']).codec
      filterMusic['open_path'] = music.status === 1 ? undefined : path.join(uno, music.origin_file_name)
      return filterMusic
    })

    // Return
    return {
      code: 200,
      data: { musicData: filterMusicData, count }
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
 * 批量上传音频文件 Service
 * @param musicFiles
 * @param userData
 * @returns
 */
const uploadMusicBatchService = async (musicFiles, userData) => {
  try {
    const musicFilePromiseArr = []
    musicFiles.forEach(file => {
      musicFilePromiseArr.push(uploadMusicPromise(file, userData))
    })

    const datas = await Promise.all(musicFilePromiseArr)

    await calculateUserUsedStorage(userData.uno)

    return {
      code: 200,
      data: {
        message: '批量上传音频文件成功！',
        datas
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
 * 批量下载音频文件 Service
 * @param fileList
 * @param userData
 * @returns
 */
const downloadMusicBatchService = async (fileList, userData) => {
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
    // 获取音乐文件路径
    const filePaths = fileList.map(file => {
      return path.join(DEFAULT_STATIC_PATH, MUSIC_FOLDER, userData.uno, file.origin_file_name)
    })
    // 判断音乐文件是否存在
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
    // 复制音乐文件到指定缓冲区文件夹中
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
 * 批量删除音频文件 Service
 * @param fileList
 * @param userData
 * @returns
 */
const deleteMusicBatchService = async (fileList, userData) => {
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
    const musicFilePromiseArr = []
    fileList.forEach(file => {
      musicFilePromiseArr.push(removeMusicPromise(file, userData))
    })

    await Promise.all(musicFilePromiseArr)

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
 * 开始播放音乐 Service
 * @param musicData
 * @param userData
 * @returns
 */
const startPlayMusicService = async (musicData, userData) => {
  try {
    // 判断音频数据是否为空
    if (!musicData) {
      return {
        code: 400,
        data: {
          message: '音频数据不能为空'
        }
      }
    }
    // 判断音频文件是否存在
    const musicFilePath = path.join(DEFAULT_STATIC_PATH, PLAY_MUSIC_FOLDER, userData.uno, musicData.play_file_name)
    if (!fs.existsSync(musicFilePath)) {
      return {
        code: 400,
        data: {
          message: '播放音频文件不存在！'
        }
      }
    }
    return {
      code: 200,
      data: {
        title: musicData.song_name,
        artist: musicData.singer_name,
        src: musicData.play_file_name,
        pic: musicData.music_cover_file_name,
        message: '获取音频播放数据成功！'
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
 * 下载音频文件 Service
 * @param musicData
 * @param userData
 * @returns
 */
const downloadMusicService = async (musicData, userData) => {
  try {
    // 判断音频数据是否为空
    if (!musicData) {
      return {
        code: 400,
        data: {
          message: '音频数据不能为空'
        }
      }
    }
    // 获取音频文件路径
    const filePath = path.join(DEFAULT_STATIC_PATH, MUSIC_FOLDER, userData.uno, musicData.origin_file_name)
    // 判断音频文件是否存在
    if (!fs.existsSync(filePath)) {
      return {
        code: 400,
        data: {
          message: '音频文件不存在！'
        }
      }
    }
    // 确保用户下载文件夹存在
    const userDownloadPath = path.join(DEFAULT_STATIC_PATH, DOWNLOAD_FOLDER, userData.uno)
    fse.ensureDirSync(userDownloadPath, {})
    // 复制音频文件到缓冲区文件夹中
    const fileName = `${musicData.song_name}_${Date.now() + path.extname(musicData.origin_file_name)}`
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
 * 删除音频文件 Service
 * @param musicData
 * @param userData
 * @returns
 */
const deleteMusicService = async (musicData, userData) => {
  try {
    // 判断音频数据是否为空
    if (!musicData) {
      return {
        code: 400,
        data: {
          message: '音频数据不能为空'
        }
      }
    }

    await removeMusicPromise(musicData, userData)

    await calculateUserUsedStorage(userData.uno)

    return {
      code: 200,
      data: {
        message: '删除音频文件成功'
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
 * 修改音频开放状态 Service
 * @param musicData
 * @param userData
 * @returns
 */
const updateMusicStatusService = async (musicData, userData) => {
  try {
    // 判断音频数据是否为空
    if (!musicData) {
      return {
        code: 400,
        data: {
          message: '音频数据不能为空'
        }
      }
    }
    // 查询音频文件原先开放状态
    const [originMusicData] = await mysqlHandler('select * from music where id = ?', [musicData.id])
    console.log()
    if (originMusicData.status === 1) {
      if (musicData.status === 1) {
        return {
          code: 200,
          data: {
            message: '音频状态无需修改'
          }
        }
      } else {
        fse.copySync(path.join(DEFAULT_STATIC_PATH, MUSIC_FOLDER, userData.uno, musicData.origin_file_name), path.join(DEFAULT_STATIC_PATH, OPENAPI_FOLDER, userData.uno, musicData.origin_file_name))
        await mysqlHandler('update music set status = ? where id = ?', [musicData.status, musicData.id])
      }
    } else {
      if (musicData.status === 2) {
        return {
          code: 200,
          data: {
            message: '音频状态无需修改'
          }
        }
      } else {
        fse.removeSync(path.join(DEFAULT_STATIC_PATH, OPENAPI_FOLDER, userData.uno, musicData.origin_file_name))
        await mysqlHandler('update music set status = ? where id = ?', [musicData.status, musicData.id])
      }
    }

    return {
      code: 200,
      data: {
        message: '修改音频状态成功'
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
  uploadMusicService,
  uploadMusicCoverService,
  uploadMusicDataService,
  deleteTempMusicService,
  selectMusicListService,
  uploadMusicBatchService,
  downloadMusicBatchService,
  deleteMusicBatchService,
  startPlayMusicService,
  downloadMusicService,
  deleteMusicService,
  updateMusicStatusService
}
