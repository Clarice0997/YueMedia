// import modules
const path = require('path')
const fse = require('fs-extra')
const { mysqlHandler } = require('../config/mysql')
const fs = require('fs')

// 存储文件位置常量
const PLAY_MUSIC_FOLDER = process.env.PLAY_MUSIC_FOLDER
const MUSIC_FOLDER = process.env.MUSIC_FOLDER
const COVER_FOLDER = process.env.COVER_FOLDER
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const OPENAPI_FOLDER = process.env.OPENAPI_FOLDER

const removeMusicPromise = (file, userData) => {
  return new Promise(async (resolve, reject) => {
    // 删除文件 源文件 封面文件 播放文件
    const musicPath = path.join(DEFAULT_STATIC_PATH, MUSIC_FOLDER, userData.uno, file.origin_file_name)
    const coverPath = path.join(DEFAULT_STATIC_PATH, COVER_FOLDER, userData.uno, file.music_cover_file_name)
    const playMusicPath = path.join(DEFAULT_STATIC_PATH, PLAY_MUSIC_FOLDER, userData.uno, file.play_file_name)
    fse.removeSync(musicPath)
    fse.removeSync(coverPath)
    fse.removeSync(playMusicPath)
    // 判断是否为开放文件 删除开放文件
    if (file.status === 2) {
      if (fs.existsSync(path.join(DEFAULT_STATIC_PATH, OPENAPI_FOLDER, userData.uno, file.origin_file_name))) {
        fs.unlinkSync(path.join(DEFAULT_STATIC_PATH, OPENAPI_FOLDER, userData.uno, file.origin_file_name))
      }
    }
    // 删除数据库数据
    await mysqlHandler('delete from music where id = ?', [file.id])
    resolve(true)
    try {
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { removeMusicPromise }
