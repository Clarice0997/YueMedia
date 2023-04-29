// import modules
const path = require('path')
const fs = require('fs')
const fse = require('fs-extra')
const { mysqlHandler } = require('../config/mysql')

// 存储文件位置常量
const VIDEO_FOLDER = process.env.VIDEO_FOLDER
const VIDEO_COVER_FOLDER = process.env.VIDEO_COVER_FOLDER
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const OPENAPI_FOLDER = process.env.OPENAPI_FOLDER

const removeVideoPromise = (file, userData) => {
  return new Promise(async (resolve, reject) => {
    // 删除文件 源文件 封面文件
    const videoPath = path.join(DEFAULT_STATIC_PATH, VIDEO_FOLDER, userData.uno, file.video_file_name)
    const coverPath = path.join(DEFAULT_STATIC_PATH, VIDEO_COVER_FOLDER, userData.uno, file.video_cover_file_name)
    fse.removeSync(videoPath)
    fse.removeSync(coverPath)
    // 判断是否为开放文件 删除开放文件
    if (file.status === 2) {
      if (fs.existsSync(path.join(DEFAULT_STATIC_PATH, OPENAPI_FOLDER, userData.uno, file.video_file_name))) {
        fs.unlinkSync(path.join(DEFAULT_STATIC_PATH, OPENAPI_FOLDER, userData.uno, file.video_file_name))
      }
    }
    // 删除数据库数据
    await mysqlHandler('delete from video where id = ?', [file.id])
    resolve(true)
    try {
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { removeVideoPromise }
