// import modules
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { hgetRedis } = require('../utils/redis/RedisHandler')
const { mysqlHandler } = require('../config/mysql')
const { AudioConvertQueues } = require('../models/audioConvertQueueModel')
const { OpenApiRecord } = require('../models/openApiRecordModel')
const { DownloadRecord } = require('../models/downloadRecordModel')
const { formatDate } = require('../utils/formatDate')

/**
 * getLoginRecord Service
 * @returns {Promise<void>}
 */
const getLoginRecordService = async () => {
  try {
    const handledLoginRecords = JSON.parse(await hgetRedis('calculator', 'total_login_record'))

    // 更新返回数据
    return {
      data: {
        message: '登录记录数据获取成功',
        data: handledLoginRecords
      },
      code: 200
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
 * 获取用户概述数据 Service
 * @param uno
 * @returns
 */
const getUserTotalDataService = async uno => {
  try {
    // 四种数据 音频 视频 任务 存储容量（百分比）
    // 获取音频数据
    const musicData = await mysqlHandler('select * from music where upload_by = ?', [uno])
    const musicCount = musicData.length
    const musicCodec = await mysqlHandler('select * from music_codec')
    const filterMusicData = musicData.map(music => {
      let filterMusic = music
      filterMusic['music_codec'] = musicCodec.find(codec => codec.id === filterMusic['music_codec']).codec
      return filterMusic
    })
    // 统计音频编码分布
    const musicStatistics = []
    filterMusicData.forEach(music => {
      const item = musicStatistics.findIndex(data => data.name === music.music_codec)
      if (item === -1) {
        musicStatistics.push({ value: 1, name: music.music_codec })
      } else {
        musicStatistics[item].value++
      }
    })

    // 获取视频数据
    const videoData = await mysqlHandler('select * from video where upload_by = ?', [uno])
    const videoCount = videoData.length
    const videoCodec = await mysqlHandler('select * from video_codec')
    const filterVideoData = videoData.map(video => {
      let filterVideo = video
      filterVideo['video_codec'] = videoCodec.find(codec => codec.id === filterVideo['video_codec']).codec
      return filterVideo
    })
    // 统计音频编码分布
    const videoStatistics = []
    filterVideoData.forEach(video => {
      const item = videoStatistics.findIndex(data => data.name === video.video_codec)
      if (item === -1) {
        videoStatistics.push({ value: 1, name: video.video_codec })
      } else {
        videoStatistics[item].value++
      }
    })

    // 获取任务总数
    const taskData = await AudioConvertQueues.find({ userId: uno })

    // 获取存储空间
    const userStorage = await hgetRedis('user_storage', uno)
    const userUsedStorage = await hgetRedis('user_used_storage', uno)
    const storageUsedPercent = Math.ceil((userUsedStorage / userStorage) * 100)
    const storage = `${storageUsedPercent} %`

    // 获取 Open API 调用情况数据
    let openApiData = await OpenApiRecord.find({ userId: uno })
    // 构建返回数据
    let openApiLineResult = []
    let dateCountMap = {}
    let typeCountMap = {}

    if (openApiData.length !== 0) {
      for (let i = 0; i < openApiData.length; i++) {
        let item = openApiData[i]
        let date = formatDate(item.startTime)
        let type = item.type

        // 统计每天的请求次数和响应时间
        if (!dateCountMap[date]) {
          dateCountMap[date] = { count: 0, duration: 0 }
        }
        if (!item.duration) {
          item.duration = 0
        }
        dateCountMap[date].count++
        dateCountMap[date].duration += item.duration

        // 统计每种类型的请求次数
        if (!typeCountMap[date]) {
          typeCountMap[date] = {}
        }
        if (!typeCountMap[date][type]) {
          typeCountMap[date][type] = 0
        }
        typeCountMap[date][type]++
      }

      // 将统计结果转换成需要的数据结构
      for (let date in dateCountMap) {
        let count = dateCountMap[date].count
        let duration = dateCountMap[date].duration
        let averageDuration = duration / count
        let types = []
        for (let type in typeCountMap[date]) {
          types.push({ name: type, count: typeCountMap[date][type] })
        }
        openApiLineResult.push({ date: date, types: types, count: count, averageDuration: averageDuration.toFixed(1) })
      }

      // 对数据进行排序
      openApiLineResult.sort((a, b) => a.date.localeCompare(b.date))

      // 对可能缺失的日期进行补全
      let startDate = new Date(openApiLineResult[0].date)
      let endDate = new Date(openApiLineResult[openApiLineResult.length - 1].date)

      for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        let dateString = formatDate(date)
        if (!dateCountMap[dateString]) {
          openApiLineResult.push({ date: dateString, types: [], count: 0, averageDuration: 0 })
        }
      }
    }

    return {
      data: {
        message: '用户概述数据获取成功',
        data: {
          music: {
            count: musicCount,
            musicStatistics
          },
          video: {
            count: videoCount,
            videoStatistics
          },
          task: {
            count: taskData.length,
            taskStatistics:
              taskData.length !== 0
                ? [
                    taskData.length !== 0
                      ? {
                          value: taskData.length,
                          name: '音频转码任务'
                        }
                      : undefined
                  ]
                : undefined
          },
          storage: {
            storage,
            storageStatistics: [
              {
                value: userUsedStorage,
                name: '已用空间'
              },
              {
                value: userStorage - userUsedStorage,
                name: '剩余空间'
              }
            ]
          },
          openApi: {
            lineData: openApiLineResult
          }
        }
      },
      code: 200
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
 * 获取 OPEN API 调用情况折线图数据 Service
 * @param uno
 * @returns
 */
const getOpenApiLineRecordService = async uno => {
  try {
    // 获取 Open API 调用情况数据
    let openApiData = await OpenApiRecord.find({ userId: uno })
    // 构建返回数据
    let openApiLineResult = []
    let dateCountMap = {}
    let typeCountMap = {}

    if (openApiData.length !== 0) {
      for (let i = 0; i < openApiData.length; i++) {
        let item = openApiData[i]
        let date = formatDate(item.startTime)
        let type = item.type

        // 统计每天的请求次数和响应时间
        if (!dateCountMap[date]) {
          dateCountMap[date] = { count: 0, duration: 0 }
        }
        if (!item.duration) {
          item.duration = 0
        }
        dateCountMap[date].count++
        dateCountMap[date].duration += item.duration

        // 统计每种类型的请求次数
        if (!typeCountMap[date]) {
          typeCountMap[date] = {}
        }
        if (!typeCountMap[date][type]) {
          typeCountMap[date][type] = 0
        }
        typeCountMap[date][type]++
      }

      // 将统计结果转换成需要的数据结构
      for (let date in dateCountMap) {
        let count = dateCountMap[date].count
        let duration = dateCountMap[date].duration
        let averageDuration = duration / count
        let types = []
        for (let type in typeCountMap[date]) {
          types.push({ name: type, count: typeCountMap[date][type] })
        }
        openApiLineResult.push({ date: date, types: types, count: count, averageDuration: averageDuration.toFixed(1) })
      }

      // 对数据进行排序
      openApiLineResult.sort((a, b) => a.date.localeCompare(b.date))

      // 对可能缺失的日期进行补全
      let startDate = new Date(openApiLineResult[0].date)
      let endDate = new Date(openApiLineResult[openApiLineResult.length - 1].date)

      for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        let dateString = formatDate(date)
        if (!dateCountMap[dateString]) {
          openApiLineResult.push({ date: dateString, types: [], count: 0, averageDuration: 0 })
        }
      }
    }

    // Return
    return {
      code: 200,
      data: {
        result: openApiLineResult
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
 * 获取下载类型饼图数据 Service
 * @param uno
 * @returns
 */
const getDownloadPieRecordService = async uno => {
  try {
    const downloadRecords = await DownloadRecord.find({ userId: uno })
    const copyDownloadRecords = JSON.parse(JSON.stringify(downloadRecords))
    const downloadRecordMap = []

    copyDownloadRecords.forEach(item => {
      const index = downloadRecordMap.findIndex(record => record.name === item.type)
      if (index === -1) {
        downloadRecordMap.push({ name: item.type, value: 1 })
      } else {
        downloadRecordMap[index].value++
      }
    })

    return {
      code: 200,
      data: {
        data: downloadRecordMap
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
 * 获取 OPEN API 调用情况饼图数据 Service
 * @param uno
 * @returns
 */
const getOpenApiPieRecordService = async uno => {
  try {
    const openApiRecords = await OpenApiRecord.find({ userId: uno })
    const copyOpenApiRecords = JSON.parse(JSON.stringify(openApiRecords))
    const openApiRecordMap = []

    copyOpenApiRecords.forEach(item => {
      const index = openApiRecordMap.findIndex(record => record.name === item.type)
      if (index === -1) {
        openApiRecordMap.push({ name: item.type, value: 1 })
      } else {
        openApiRecordMap[index].value++
      }
    })

    return {
      code: 200,
      data: {
        data: openApiRecordMap
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
 * 获取下载折线图数据 Service
 * @param uno
 * @returns
 */
const getDownloadLineRecordService = async uno => {
  try {
    let downloadData = await DownloadRecord.find({ userId: uno })
    // 构建返回数据
    let downloadLineResult = []
    let dateCountMap = {}

    if (downloadData.length !== 0) {
      for (let i = 0; i < downloadData.length; i++) {
        let item = downloadData[i]
        let date = formatDate(item.downloadStartTime)

        // 统计每天的请求次数和响应时间
        if (!dateCountMap[date]) {
          dateCountMap[date] = { count: 0, duration: 0 }
        }
        if (!item.downloadDuration) {
          item.duration = 0
        }
        dateCountMap[date].count++
        dateCountMap[date].duration += item.downloadDuration
      }

      // 将统计结果转换成需要的数据结构
      for (let date in dateCountMap) {
        let count = dateCountMap[date].count
        let duration = dateCountMap[date].duration
        let averageDuration = duration / count / 1000
        downloadLineResult.push({ date: date, count: count, averageDuration: averageDuration.toFixed(1) })
      }

      // 对数据进行排序
      downloadLineResult.sort((a, b) => a.date.localeCompare(b.date))

      // 对可能缺失的日期进行补全
      let startDate = new Date(downloadLineResult[0].date)
      let endDate = new Date(downloadLineResult[downloadLineResult.length - 1].date)

      for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
        let dateString = formatDate(date)
        if (!dateCountMap[dateString]) {
          downloadLineResult.push({ date: dateString, count: 0, averageDuration: 0 })
        }
      }
    }

    // Return
    return {
      code: 200,
      data: {
        result: downloadLineResult
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
 * 获取 SQL 折线图数据 Service
 * @returns
 */
const getSqlLineRecordService = async () => {
  try {
    const handledSqlRecords = JSON.parse(await hgetRedis('calculator', 'total_sql_record'))

    // 更新返回数据
    return {
      data: {
        message: '获取 SQL 折线图数据获取成功',
        result: handledSqlRecords
      },
      code: 200
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
  getLoginRecordService,
  getUserTotalDataService,
  getOpenApiLineRecordService,
  getDownloadPieRecordService,
  getOpenApiPieRecordService,
  getDownloadLineRecordService,
  getSqlLineRecordService
}
