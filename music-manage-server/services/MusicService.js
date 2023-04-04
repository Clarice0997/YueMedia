// import modules
const path = require('path')
const fs = require('fs')
const { generateMD5 } = require('../utils/MD5.js')
const mm = require('music-metadata')
const { mysqlHandler } = require('../config/mysql')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegError = require('../utils/ffmpegError')
const { spawnSync } = require('child_process')
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')

// 存储文件位置常量
const TEMP_MUSIC_FOLDER = process.env.TEMP_MUSIC_FOLDER
const TEMP_COVER_FOLDER = process.env.TEMP_COVER_FOLDER
const PLAY_MUSIC_FOLDER = process.env.PLAY_MUSIC_FOLDER
const MUSIC_FOLDER = process.env.MUSIC_FOLDER
const COVER_FOLDER = process.env.COVER_FOLDER

/**
 * 上传音乐文件
 * @param musicFile
 * @returns
 */
const uploadMusicService = async musicFile => {
  try {
    // 根据音乐文件生成 MD5
    const musicMD5 = await generateMD5(musicFile.buffer)
    // 定义音乐保存名
    const musicName = musicMD5 + Date.now()
    // 获取音乐文件元数据
    const metadata = await mm.parseBuffer(musicFile.buffer)
    console.log(metadata)
    // 判断音乐封面是否存在
    let coverData
    let musicCoverName
    // 音乐封面存在存储音乐封面 如果不存在则采用默认音乐封面
    if (metadata.common.picture) {
      if (metadata.common.picture.length > 0) {
        musicCoverName = `${musicName}.jpg`
        // 获取音乐封面图
        coverData = metadata.common.picture[0].data
        // 生成音乐封面存储地址
        const coverPath = path.join(__dirname, '..', 'static', TEMP_COVER_FOLDER, musicCoverName)
        // 临时存储音乐封面
        fs.writeFileSync(coverPath, coverData)
      }
    } else {
      musicCoverName = `${musicName}.jpg`
      // 生成音乐封面存储地址
      const coverPath = path.join(__dirname, '..', 'static', TEMP_COVER_FOLDER, musicCoverName)
      // 临时存储音乐封面
      fs.copyFileSync(path.join(__dirname, '..', 'public', 'cover.jpg'), coverPath)
    }
    // 生成音乐文件存储地址
    const musicFileName = musicName + path.extname(musicFile.originalname)
    const musicPath = path.join(__dirname, '..', 'static', TEMP_MUSIC_FOLDER, musicFileName)
    // 临时存储音乐文件
    fs.writeFileSync(musicPath, musicFile.buffer)
    // 返回成功消息对象
    return {
      code: 200,
      data: {
        meta: {
          ...metadata.common,
          picture: undefined,
          track: undefined,
          disk: undefined,
          movementIndex: undefined,
          encodersettings: undefined,
          codec: metadata.format.container,
          size: musicFile.buffer.length
        },
        songId: musicName,
        coverName: musicCoverName,
        musicName: musicFileName
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
    const originCoverPath = path.join(__dirname, '..', 'static', TEMP_COVER_FOLDER, originCoverName)
    fs.unlinkSync(originCoverPath)
    // 将新音乐封面文件写入临时文件夹
    const coverPath = path.join(__dirname, '..', 'static', TEMP_COVER_FOLDER, `${musicName}${path.extname(musicCoverFile.originalname)}`)
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
 * @returns {Promise<{code: number, data: {message}}|{code: number, data: {message: string}}>}
 */
const uploadMusicDataService = async data => {
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
    // 判断音乐文件是否需要转码 供播放使用
    let playFileName = `${songId}.mp3`
    if (musicCodec !== 'MPEG') {
      const inputPath = path.join(__dirname, '..', 'static', TEMP_MUSIC_FOLDER, musicFileName)
      const outputPath = path.join(__dirname, '..', 'static', PLAY_MUSIC_FOLDER, playFileName)
      // 异步进程转码同步
      const result = spawnSync('ffmpeg', ['-i', inputPath, '-c:a', 'libmp3lame', outputPath])
      // 等待转码结束判断是否成功 标准输出流和错误输出流
      if (result.status === 0) {
        console.log(result.stdout.toString())
        console.log('格式转换完成')
      } else {
        throw new ffmpegError(result.stderr.toString('utf8'))
      }
    } else {
      const inputPath = path.join(__dirname, '..', 'static', TEMP_MUSIC_FOLDER, musicFileName)
      const outputPath = path.join(__dirname, '..', 'static', PLAY_MUSIC_FOLDER, musicFileName)
      // 复制文件到播放文件夹
      fs.copyFileSync(inputPath, outputPath)
    }

    // 持久化临时文件夹中的临时音乐文件和音乐封面
    // 剪切临时音乐文件夹中的音乐文件到持久化音乐文件夹
    fs.renameSync(path.join(__dirname, '..', 'static', TEMP_MUSIC_FOLDER, musicFileName), path.join(__dirname, '..', 'static', MUSIC_FOLDER, musicFileName))
    // 剪切临时音乐封面文件夹中的音乐封面到持久化音乐封面文件夹
    fs.renameSync(path.join(__dirname, '..', 'static', TEMP_COVER_FOLDER, musicCoverFileName), path.join(__dirname, '..', 'static', COVER_FOLDER, musicCoverFileName))

    // 准备数据 插入数据库
    const query = 'insert into music(song_id,song_name,song_size,music_codec,play_file_name,music_cover_file_name,origin_file_name,singer_name,album_name,year) values(?,?,?,?,?,?,?,?,?,?)'
    const params = [songId, songName, songSize, musicCodec, playFileName, musicCoverFileName, musicFileName, singerName ? singerName : null, albumName ? albumName : null, year ? year : null]
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

module.exports = { uploadMusicService, uploadMusicCoverService, uploadMusicDataService }
