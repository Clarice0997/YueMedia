const fs = require('fs')
const path = require('path')

// 扫描文件夹路径
const folders = [path.join(__dirname, '..', 'static', process.env.TEMP_COVER_FOLDER), path.join(__dirname, '..', 'static', process.env.TEMP_MUSIC_FOLDER)]
const maxAge = 1800000 // 30 minutes in milliseconds

// 删除过期文件方法
const deleteExpiredFiles = () => {
  folders.forEach(folder => {
    fs.readdir(folder, (err, files) => {
      if (err) throw err

      files.forEach(file => {
        const filePath = path.join(folder, file)
        const stats = fs.statSync(filePath)
        const age = Date.now() - stats.ctimeMs
        if (age > maxAge) {
          fs.unlink(filePath, err => {
            if (err) throw err
            console.log(`${filePath} has been deleted`)
          })
        }
      })
    })
  })
}

// 开机清理一次
deleteExpiredFiles()

// 定期清理临时文件
setInterval(deleteExpiredFiles, maxAge)
