// import modules
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { hgetRedis } = require('../utils/redis/RedisHandler')

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

module.exports = { getLoginRecordService }
