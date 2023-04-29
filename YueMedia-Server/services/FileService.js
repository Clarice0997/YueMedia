// import modules
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { AudioConvertQueues } = require('../models/audioConvertQueueModel')
const path = require('path')

// 存储文件位置常量
const CONVERT_MUSIC_FOLDER = process.env.CONVERT_MUSIC_FOLDER

/**
 * 获取个人处理文件列表 Service
 * @param pageNumber
 * @param pageSize
 * @param uno
 * @returns
 */
const getMyFileListService = async (pageNumber, pageSize, uno) => {
  try {
    // 判断是否存在页码
    if (typeof pageNumber == 'undefined') {
      pageNumber = 1
    }
    // 判断是否存在页面条数限制
    if (typeof pageSize == 'undefined') {
      pageSize = 10
    }
    // 判断 页码和页面条数范围
    if (pageNumber <= 0 || pageSize <= 0 || !/\d+/gi.test(pageNumber) || !/\d+/gi.test(pageSize)) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }
    // 查询数据条数
    const count = await AudioConvertQueues.countDocuments({ userId: uno })

    // 判断是否存在上传音频数据
    if (count === 0) {
      return {
        code: 200,
        data: {
          message: '不存在上传音频数据',
          count: 0
        }
      }
    }

    // 判断查询数据是否超出范围
    if (pageNumber * pageSize - pageSize >= count) {
      return {
        code: 200,
        data: {
          message: '数据超出范围',
          count
        }
      }
    }

    // 查询个人处理文件列表
    const queues = await AudioConvertQueues.find({ userId: uno })
      .sort({ createdAt: 'desc' })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)

    // 深拷贝原型
    const newQueues = JSON.parse(JSON.stringify(queues))

    // 处理返回数据（添加下载相对路径）
    const filterQueues = newQueues.map(queue => {
      let filterQueue = queue
      if (filterQueue.status === 2) {
        filterQueue.downloadPath = path.join(CONVERT_MUSIC_FOLDER, `${queue.taskId}.zip`)
      }
      return filterQueue
    })

    return {
      code: 200,
      data: { count, queues: filterQueues }
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
 * 获取个人已处理文件列表 Service
 * @param uno
 * @returns
 */
const getMyFinishFileListService = async uno => {
  try {
    // 查询数据条数
    const count = await AudioConvertQueues.countDocuments({ userId: uno })

    // 判断是否存在已处理文件
    if (count === 0) {
      return {
        code: 200,
        data: {
          message: '不存在已处理文件数据',
          count: 0
        }
      }
    }

    // 查询个人已处理文件列表
    const queues = await AudioConvertQueues.find({ userId: uno, status: 2 }).sort({ createdAt: 'desc' })

    // 深拷贝原型
    const newQueues = JSON.parse(JSON.stringify(queues))

    // 处理返回数据（添加下载相对路径）
    const filterQueues = newQueues.map(queue => {
      let filterQueue = queue
      if (filterQueue.status === 2) {
        filterQueue.downloadPath = path.join(CONVERT_MUSIC_FOLDER, `${queue.taskId}.zip`)
      }
      return filterQueue
    })

    return {
      code: 200,
      data: { queues: filterQueues }
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
 * 删除个人处理文件 Service
 * @param taskId
 * @returns
 */
const deleteMyFileService = async taskId => {
  try {
    // 判断参数是否存在
    if (!taskId) {
      return {
        code: 400,
        data: {
          message: '参数不合法！'
        }
      }
    }

    await AudioConvertQueues.findOneAndDelete({ taskId })

    return {
      code: 200,
      data: {
        message: '删除处理文件记录成功'
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

module.exports = { getMyFileListService, deleteMyFileService, getMyFinishFileListService }
