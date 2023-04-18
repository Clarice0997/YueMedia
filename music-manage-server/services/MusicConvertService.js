// import modules
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { generateMD5 } = require('../utils/MD5')
const path = require('path')
const fs = require('fs')
const mm = require('music-metadata')
const { mysqlHandler } = require('../config/mysql')

const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const TEMP_PARSE_MUSIC_FOLDER = process.env.TEMP_PARSE_MUSIC_FOLDER

/**
 * 文件分析 Service
 * @param file
 * @returns
 */
const analyseFileService = async file => {
  try {
    const { originalname, encoding, mimetype, size } = file
    // 音乐文件获取元数据
    if (mimetype.split('/').shift() === 'audio') {
      const metadata = await mm.parseBuffer(file.buffer)
      return {
        code: 200,
        data: {
          originalname,
          encoding,
          mimetype,
          size,
          format: metadata.format,
          common: { ...metadata.common, picture: undefined }
        }
      }
    } else {
      return {
        code: 200,
        data: { originalname, encoding, mimetype, size }
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
 * 上传转码音乐文件 Service
 * @param files
 * @param [fileNames]
 * @returns
 */
const uploadConvertMusicService = async (files, fileNames) => {
  try {
    let filesDetail = []
    if (fileNames) fileNames = JSON.parse(fileNames)
    // 循环待转码文件 存入待转码文件夹
    for (let i = 0; i < files.length; i++) {
      console.log(files[i])
      // 根据音乐文件生成 MD5
      const musicMD5 = await generateMD5(files[i].buffer)
      // 获取音乐文件元数据
      const metadata = await mm.parseBuffer(files[i].buffer)
      // 定义音乐保存名
      const musicName = musicMD5 + Date.now()
      // 生成待解析音乐文件存储地址
      const musicFileName = musicName + path.extname(files[i].originalname)
      const musicPath = path.join(DEFAULT_STATIC_PATH, TEMP_PARSE_MUSIC_FOLDER, musicFileName)
      // 临时存储待解析音乐文件
      fs.writeFileSync(musicPath, files[i].buffer)
      // 存储上传转码音乐文件信息
      filesDetail.push({
        originalName: fileNames ? fileNames[i] : files[i].originalname,
        status: 1,
        encoding: files[i].encoding,
        mimetype: files[i].mimetype,
        container: metadata.format.container,
        codec: metadata.format.codec,
        size: files[i].size,
        musicFileName
      })
    }
    return {
      code: 200,
      data: { filesDetail }
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

// 删除待转码音乐文件 Service
const deleteConvertMusicService = async targetFile => {
  try {
    // 数据校验
    if (!targetFile) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }
    // 删除临时代转换音乐文件
    const targetFilePath = path.join(DEFAULT_STATIC_PATH, TEMP_PARSE_MUSIC_FOLDER, targetFile)
    // 判断文件是否存在再删除
    if (fs.existsSync(targetFilePath)) {
      fs.unlinkSync(targetFilePath)
    } else {
      return {
        code: 404,
        data: {
          message: '临时文件不存在'
        }
      }
    }

    // success
    return {
      code: 200,
      data: {
        message: '删除临时数据成功'
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

// 获取支持音乐格式 Service
const getSupportMusicCodecService = async targetFile => {
  try {
    // 查询数据
    const supportMusicCodec = await mysqlHandler('select * from music_codec')

    // success
    return {
      code: 200,
      data: { supportMusicCodec }
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

module.exports = {
  analyseFileService,
  uploadConvertMusicService,
  deleteConvertMusicService,
  getSupportMusicCodecService
}
