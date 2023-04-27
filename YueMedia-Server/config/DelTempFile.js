const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')

// 默认超时时间
const staticMaxAge = 1800000
// 扫描文件夹配置
const folders = {
  TEMP_COVER_FOLDER: {
    path: path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_COVER_FOLDER),
    maxAge: staticMaxAge
  },
  TEMP_MUSIC_FOLDER: {
    path: path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_MUSIC_FOLDER),
    maxAge: staticMaxAge
  },
  TEMP_PLAY_MUSIC_FOLDER: {
    path: path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_PLAY_MUSIC_FOLDER),
    maxAge: staticMaxAge
  },
  TEMP_PARSE_MUSIC_FOLDER: {
    path: path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_PARSE_MUSIC_FOLDER),
    maxAge: staticMaxAge
  },
  CONVERT_MUSIC: {
    path: path.join(process.env.DEFAULT_STATIC_PATH, process.env.CONVERT_MUSIC_FOLDER),
    maxAge: 3600000
  },
  DOWNLOAD_FOLDER: {
    path: path.join(process.env.DEFAULT_STATIC_PATH, process.env.DOWNLOAD_FOLDER),
    maxAge: 3600000
  },
  TEMP_VIDEO_FOLDER: {
    path: path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_VIDEO_FOLDER),
    maxAge: staticMaxAge
  },
  TEMP_VIDEO_COVER_FOLDER: {
    path: path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_VIDEO_COVER_FOLDER),
    maxAge: staticMaxAge
  }
}

const deleteExpiredFiles = () => {
  for (const folder in folders) {
    fs.readdir(folders[folder].path, (err, files) => {
      if (err) throw err
      if (files.length === 0) return

      files.forEach(file => {
        const filePath = path.join(folders[folder].path, file)
        const stats = fs.statSync(filePath)
        const age = Date.now() - stats.ctimeMs
        if (age > folders[folder].maxAge) {
          if (stats.isDirectory()) {
            if (fs.readdirSync(filePath).length === 0) {
              // 如果文件夹为空，直接返回
              return
            } else {
              fse.removeSync(filePath)
              console.log(`${filePath} has been deleted`)
            }
          } else {
            fs.unlink(filePath, err => {
              if (err) throw err
              console.log(`${filePath} has been deleted`)
            })
          }
        }
      })
    })
  }
}

// 开机清理一次
deleteExpiredFiles()

// 定期清理临时文件
setInterval(deleteExpiredFiles, staticMaxAge)
