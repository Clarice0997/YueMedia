// import modules
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const { generateMD5 } = require('../utils/MD5.js')
const mm = require('music-metadata')

// 存储文件位置常量
const TEMP_MUSIC_FOLDER = process.env.TEMP_MUSIC_FOLDER
const TEMP_COVER_FOLDER = process.env.TEMP_COVER_FOLDER
const MUSIC_FOLDER = process.env.MUSIC_FOLDER
const COVER_FOLDER = process.env.COVER_FOLDER

// Promisify fs
const unlink = promisify(fs.unlink)
const rename = promisify(fs.rename)

/**
 * 上传音乐文件
 * @param {*} musicFile
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
    // 判断音乐封面是否存在
    let coverData
    if (metadata.common.picture.length > 0) {
      // 获取音乐封面图
      coverData = metadata.common.picture[0].data
      // 生成音乐封面存储地址
      const coverPath = path.join(__dirname, '..', 'static', TEMP_COVER_FOLDER, `${musicName}.jpg`)
      // 临时存储音乐封面
      fs.writeFileSync(coverPath, coverData)
    }
    // 生成音乐文件存储地址
    const musicFileName = musicName + path.extname(musicFile.originalname)
    const musicPath = path.join(__dirname, '..', 'static', TEMP_MUSIC_FOLDER, `${musicFileName}`)
    // 临时存储音乐文件
    fs.writeFileSync(musicPath, musicFile.buffer)
    // 返回成功消息对象
    return {
      code: 200,
      data: {
        meta: { ...metadata.common, picture: undefined },
        coverName: `${musicName}.jpg`,
        musicName: musicFileName
      }
    }
  } catch (error) {
    console.log(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

const uploadMusicCoverService = async () => {}

const uploadMusicDataService = async () => {}

module.exports = { uploadMusicService, uploadMusicCoverService, uploadMusicDataService }
