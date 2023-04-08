// import modules
const { LoginRecord } = require('../models/loginRecordModel')
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')

/**
 * getLoginRecord Service
 * @returns {Promise<void>}
 */
const getLoginRecordService = async () => {
  try {
    // 获取所有登录记录数据
    const loginRecords = await LoginRecord.find({})

    // 获取登录日期列表
    const loginDates = loginRecords.map(loginRecord => {
      const year = loginRecord.loginTime.getFullYear()
      const month = loginRecord.loginTime.getMonth() + 1
      const day = loginRecord.loginTime.getDate()
      return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
    })

    // 统计每个登录日期的数量
    const loginRecordsByDate = loginDates.reduce((acc, date) => {
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // 遍历所有日期，将登录记录为空的日期数量设为0
    const earliestLoginDate = new Date(Math.min(...loginDates.map(date => new Date(date))))
    const latestLoginDate = new Date(Math.max(...loginDates.map(date => new Date(date))))
    for (let d = new Date(earliestLoginDate); d <= latestLoginDate; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const day = d.getDate()
      const date = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
      if (!loginRecordsByDate[date]) {
        loginRecordsByDate[date] = 0
      }
    }

    // 将统计结果转换为数组形式，并按日期升序排序
    const handledLoginRecords = Object.entries(loginRecordsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

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
