// import modules
const { mysqlHandler } = require('../../config/mysql')
const { spawnSync } = require('child_process')
const path = require('path')
const fs = require('fs')

// Path
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const TEMP_PARSE_MUSIC_FOLDER = process.env.TEMP_PARSE_MUSIC_FOLDER
const CONVERT_MUSIC_FOLDER = process.env.CONVERT_MUSIC_FOLDER

const findEncoder = async (originCodec, targetCodec) => {
  // 查询对应编码 Id 和 编码后缀
  const datas = await mysqlHandler(`select * from music_codec where codec in (?,?)`, [originCodec, targetCodec])
  let originCodecId, targetCodecId, targetExtname
  await datas.forEach(data => {
    if (data.codec === originCodec) {
      originCodecId = data.id
    } else if (data.codec === targetCodec) {
      targetCodecId = data.id
      targetExtname = data.extname
    }
  })
  // 查找合适的编码器
  const encoderData = await mysqlHandler(`select encoder from music_encoder where origin_codec = ? and target_codec = ?`, [originCodecId, targetCodecId])
  const encoder = encoderData[0].encoder
  // 返回值
  return { encoder, targetExtname }
}

// 转码函数
async function convertAudio(taskId, musicFileName, originalName, originCodec, targetCodec) {
  return new Promise(async (resolve, reject) => {
    try {
      // 查看文件是否存在
      const originFilePath = path.join(DEFAULT_STATIC_PATH, TEMP_PARSE_MUSIC_FOLDER, musicFileName)
      if (!fs.existsSync(originFilePath)) reject('文件不存在')
      // 获取对应编码器
      const { encoder, targetExtname } = await findEncoder(originCodec, targetCodec)
      const targetFilePath = path.join(DEFAULT_STATIC_PATH, CONVERT_MUSIC_FOLDER, musicFileName.split('.').shift() + targetExtname)
      // 多线程转码
      // TODO: 转码记录
      const result = spawnSync('ffmpeg', ['-i', originFilePath, '-c:a', encoder, targetFilePath])
      if (result.status === 0) {
        // 删除待转码文件
        fs.unlinkSync(originFilePath)
        // 返回转码结果文件名
        resolve(originalName.split('.').shift() + targetExtname)
      } else {
        reject(new Error(result.stderr.toString('utf8')))
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { convertAudio }
