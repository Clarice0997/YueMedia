// import modules
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')

/**
 * ncm 解码
 * @param file
 * @param musicName
 * @returns
 */
const ncmCracker = async (file, musicName) => {
  // 将文件写入临时文件夹
  const musicFileName = musicName + path.extname(file.originalname)
  const ncmMusicPath = path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_MUSIC_FOLDER, musicFileName)
  fs.writeFileSync(ncmMusicPath, file.buffer)
  // 定义转码文件路径
  const covertMusicPath = path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_MUSIC_FOLDER)
  // 转码
  await exec(`ncmdump -o ${covertMusicPath} ${ncmMusicPath}`, error => {
    if (error) {
      console.error(`exec error: ${error}`)
      throw new Error(error)
    }
  })
  // Promise异步 等待文件转码成功（检测是否转码结束）
  return new Promise(resolve => {
    // 音频文件
    let mp3Buffer
    // 音频文件可能有两种类型 mp3 / flac
    const tempMp3Path = path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_MUSIC_FOLDER, `${musicName}.mp3`)
    const tempFlacPath = path.join(process.env.DEFAULT_STATIC_PATH, process.env.TEMP_MUSIC_FOLDER, `${musicName}.flac`)
    // 循环查看文件是否存在
    // 循环计数
    let count = 0
    const findFileExist = setInterval(() => {
      // 查看文件是否存在
      if (fs.existsSync(tempMp3Path)) {
        mp3Buffer = fs.readFileSync(tempMp3Path)
        resolve({ musicFileName: `${musicName}.mp3`, mp3Buffer, originFilePath: tempMp3Path })
        // 删除 ncm 源文件
        fs.unlinkSync(ncmMusicPath)
        // 清除计时器
        clearInterval(findFileExist)
      } else if (fs.existsSync(tempFlacPath)) {
        mp3Buffer = fs.readFileSync(tempFlacPath)
        resolve({ musicFileName: `${musicName}.flac`, mp3Buffer, originFilePath: tempFlacPath })
        // 删除 ncm 源文件
        fs.unlinkSync(ncmMusicPath)
        // 清除计时器
        clearInterval(findFileExist)
      } else {
        if (count >= 5) {
          // 删除 ncm 源文件
          fs.unlinkSync(ncmMusicPath)
          clearInterval(findFileExist)
          resolve({ code: 500, data: { message: '转码超时' } })
        }
        count++
      }
    }, 1000)
  })
}

module.exports = { ncmCracker }
