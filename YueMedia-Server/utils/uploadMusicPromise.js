// import modules
const { generateMD5 } = require('./MD5')
const path = require('path')
const fse = require('fs-extra')
const { ncmCracker } = require('./music/ncmCracker')
const mm = require('music-metadata')
const fs = require('fs')
const { spawnSync } = require('child_process')
const { audioConvertRecord } = require('../models/audioConvertRecordModel')
const ffmpegError = require('./ffmpegError')
const { mysqlHandler } = require('../config/mysql')

// 存储文件位置常量
const PLAY_MUSIC_FOLDER = process.env.PLAY_MUSIC_FOLDER
const MUSIC_FOLDER = process.env.MUSIC_FOLDER
const COVER_FOLDER = process.env.COVER_FOLDER
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const DIRPATH = process.env.DIRPATH

const uploadMusicPromise = (file, userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 根据音乐文件生成 MD5
      const musicMD5 = await generateMD5(file.buffer)
      // 定义音乐保存名
      const musicName = musicMD5 + Date.now()
      // 判断用户文件夹是否存在，没有则创建文件夹
      const userMusicFileDir = path.join(DEFAULT_STATIC_PATH, MUSIC_FOLDER, userData.uno)
      const userPlayMusicFileDir = path.join(DEFAULT_STATIC_PATH, PLAY_MUSIC_FOLDER, userData.uno)
      const userMusicCoverFileDir = path.join(DEFAULT_STATIC_PATH, COVER_FOLDER, userData.uno)
      fse.ensureDirSync(userMusicFileDir, {})
      fse.ensureDirSync(userPlayMusicFileDir, {})
      fse.ensureDirSync(userMusicCoverFileDir, {})
      // 判断文件类型 是否需要解密
      if (file.mimetype === 'application/octet-stream') {
        // NCM 格式处理
        const ncmData = await ncmCracker(file, musicName)
        // 解码错误返回
        if (ncmData.code) {
          reject({
            code: ncmData.code,
            data: {
              message: ncmData.data.message
            }
          })
        }
        const { musicFileName, musicBuffer, originFilePath } = ncmData
        // 获取音乐文件元数据
        const metadata = await mm.parseBuffer(musicBuffer)
        // 判断音乐封面是否存在
        let coverData
        let musicCoverName = `${musicName}.jpg`
        // 音乐封面存在存储音乐封面 如果不存在则采用默认音乐封面
        if (metadata.common.picture) {
          if (metadata.common.picture.length > 0) {
            // 获取音乐封面图
            coverData = metadata.common.picture[0].data
            // 生成音乐封面存储地址
            const coverPath = path.join(userMusicCoverFileDir, musicCoverName)
            // 存储音乐封面
            fs.writeFileSync(coverPath, coverData)
          }
        } else {
          // 生成音乐封面存储地址
          const coverPath = path.join(userMusicCoverFileDir, musicCoverName)
          // 存储音乐封面
          fs.copyFileSync(path.join(DIRPATH, 'public', 'cover.jpg'), coverPath)
        }
        // 存储播放文件
        const playFilePath = path.join(userPlayMusicFileDir, `${musicName}.mp3`)
        if (metadata.format.container === 'MPEG') {
          // 编码格式为 MPEG 直接复制文件
          fs.copyFileSync(originFilePath, playFilePath)
        } else {
          // 编码格式不为 MPEG 转码文件
          // 异步进程转码同步
          let startTime, endTime
          startTime = new Date()
          const result = spawnSync('ffmpeg', ['-i', originFilePath, '-c:a', 'libmp3lame', playFilePath])
          // 等待转码结束判断是否成功 标准输出流和错误输出流
          if (result.status === 0) {
            endTime = new Date()
            audioConvertRecord(musicName, 'uploadMusicService', file.buffer.length, metadata.format.container, 'MPEG', endTime - startTime)
          } else {
            reject(ffmpegError(result.stderr.toString('utf8')))
          }
        }

        // 准备数据 插入数据库
        // 查询数据库编码类型
        const codecData = await mysqlHandler(`select id from music_codec where codec = ?`, [metadata.format.codec])
        const codecId = codecData[0].id

        // 插入音乐表
        const query = 'insert into music(song_id,upload_by,song_name,song_size,music_codec,play_file_name,music_cover_file_name,origin_file_name,singer_name,album_name,year) values(?,?,?,?,?,?,?,?,?,?,?)'
        const params = [
          musicName,
          userData.uno,
          metadata.common.title ? metadata.common.title : musicName,
          file.buffer.length,
          codecId,
          `${musicName}.mp3`,
          musicCoverName,
          musicFileName,
          metadata.common.artist ? metadata.common.artist : null,
          metadata.common.album ? metadata.common.album : null,
          metadata.common.year ? metadata.common.year : null
        ]
        await mysqlHandler(query, params)

        // 返回成功消息对象
        resolve({
          meta: {
            ...metadata.common,
            comment: undefined,
            picture: undefined,
            track: undefined,
            disk: undefined,
            movementIndex: undefined,
            encodersettings: undefined,
            codec: metadata.format.codec,
            size: file.buffer.length
          },
          songId: musicName,
          coverName: musicCoverName,
          musicName: musicFileName
        })
      } else {
        // 获取音乐文件元数据
        const metadata = await mm.parseBuffer(file.buffer)
        // 判断音乐封面是否存在
        let coverData
        let musicCoverName = `${musicName}.jpg`
        // 音乐封面存在存储音乐封面 如果不存在则采用默认音乐封面
        if (metadata.common.picture) {
          if (metadata.common.picture.length > 0) {
            // 获取音乐封面图
            coverData = metadata.common.picture[0].data
            // 生成音乐封面存储地址
            const coverPath = path.join(userMusicCoverFileDir, musicCoverName)
            // 存储音乐封面
            fs.writeFileSync(coverPath, coverData)
          }
        } else {
          // 生成音乐封面存储地址
          const coverPath = path.join(userMusicCoverFileDir, musicCoverName)
          // 存储音乐封面
          fs.copyFileSync(path.join(DIRPATH, 'public', 'cover.jpg'), coverPath)
        }
        // 生成音乐文件存储地址
        const musicFileName = musicName + path.extname(file.originalname)
        const musicPath = path.join(userMusicFileDir, musicFileName)
        // 临时存储音乐文件
        fs.writeFileSync(musicPath, file.buffer)
        // 存储播放文件
        const playFilePath = path.join(userPlayMusicFileDir, `${musicName}.mp3`)
        if (metadata.format.container === 'MPEG') {
          // 编码格式为 MPEG 直接复制文件
          fs.copyFileSync(musicPath, playFilePath)
        } else {
          // 编码格式不为 MPEG 转码文件
          // 异步进程转码同步
          let startTime, endTime
          startTime = new Date()
          const result = spawnSync('ffmpeg', ['-i', musicPath, '-c:a', 'libmp3lame', playFilePath])
          // 等待转码结束判断是否成功 标准输出流和错误输出流
          if (result.status === 0) {
            endTime = new Date()
            audioConvertRecord(musicName, 'uploadMusicService', file.buffer.length, metadata.format.container, 'MPEG', endTime - startTime)
          } else {
            reject(result.stderr.toString('utf8'))
          }
        }
        // 准备数据 插入数据库
        // 查询数据库编码类型
        const codecData = await mysqlHandler(`select id from music_codec where codec = ?`, [metadata.format.codec])
        const codecId = codecData[0].id

        // 插入音乐表
        const query = 'insert into music(song_id,upload_by,song_name,song_size,music_codec,play_file_name,music_cover_file_name,origin_file_name,singer_name,album_name,year) values(?,?,?,?,?,?,?,?,?,?,?)'
        const params = [
          musicName,
          userData.uno,
          metadata.common.title ? metadata.common.title : musicName,
          file.buffer.length,
          codecId,
          `${musicName}.mp3`,
          musicCoverName,
          musicFileName,
          metadata.common.artist ? metadata.common.artist : null,
          metadata.common.album ? metadata.common.album : null,
          metadata.common.year ? metadata.common.year : null
        ]
        await mysqlHandler(query, params)

        // 返回成功消息对象
        resolve({
          meta: {
            ...metadata.common,
            comment: undefined,
            picture: undefined,
            track: undefined,
            disk: undefined,
            movementIndex: undefined,
            encodersettings: undefined,
            codec: metadata.format.codec,
            size: file.buffer.length
          },
          songId: musicName,
          coverName: musicCoverName,
          musicName: musicFileName
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { uploadMusicPromise }
