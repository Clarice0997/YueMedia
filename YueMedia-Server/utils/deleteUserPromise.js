// import modules
const path = require('path')
const fse = require('fs-extra')
const { mysqlHandler } = require('../config/mysql')

// 存储文件位置常量
const PLAY_MUSIC_FOLDER = process.env.PLAY_MUSIC_FOLDER
const MUSIC_FOLDER = process.env.MUSIC_FOLDER
const COVER_FOLDER = process.env.COVER_FOLDER
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const OPENAPI_FOLDER = process.env.OPENAPI_FOLDER
const VIDEO_FOLDER = process.env.VIDEO_FOLDER
const VIDEO_COVER_FOLDER = process.env.VIDEO_COVER_FOLDER

const deleteUserPromise = async uno => {
  return new Promise(async (resolve, reject) => {
    // 删除文件 媒体文件
    const musicPath = path.join(DEFAULT_STATIC_PATH, MUSIC_FOLDER, uno)
    const coverPath = path.join(DEFAULT_STATIC_PATH, COVER_FOLDER, uno)
    const playMusicPath = path.join(DEFAULT_STATIC_PATH, PLAY_MUSIC_FOLDER, uno)
    const videoPath = path.join(DEFAULT_STATIC_PATH, VIDEO_FOLDER, uno)
    const videoCoverPath = path.join(DEFAULT_STATIC_PATH, VIDEO_COVER_FOLDER, uno)
    const openAPIPath = path.join(DEFAULT_STATIC_PATH, OPENAPI_FOLDER, uno)
    fse.removeSync(musicPath)
    fse.removeSync(coverPath)
    fse.removeSync(playMusicPath)
    fse.removeSync(videoPath)
    fse.removeSync(videoCoverPath)
    fse.removeSync(openAPIPath)

    // 删除数据库数据
    await mysqlHandler('delete from music where upload_by = ?', [uno])
    await mysqlHandler('delete from video where upload_by = ?', [uno])
    await mysqlHandler('update users set del_flag = 2 where uno = ?', [uno])

    resolve(true)
    try {
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { deleteUserPromise }
