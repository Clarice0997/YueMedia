// import modules
const { LoginRecord } = require('../models/loginRecordModel')
const { ServiceErrorHandler } = require('../utils/ErrorCatcher')

/**
 * getLoginRecord Service
 * @returns {Promise<void>}
 */
const getLoginRecordService = async () => {
  try {
    // 按日期分组统计登录记录数据
    const loginRecordsByDate = {}
    // 获取所有登录记录数据
    const loginRecords = await LoginRecord.find({})

    // 遍历处理登录记录数据
    loginRecords.forEach(loginRecord => {
      const date = loginRecord.loginTime.getFullYear() + '-' + (loginRecord.loginTime.getMonth() + 1) + '-' + loginRecord.loginTime.getDate()
      if (loginRecordsByDate[date]) {
        loginRecordsByDate[date]++
      } else {
        loginRecordsByDate[date] = 1
      }
    })

    // 成功获取返回信息
    return {
      code: 200,
      data: {
        message: '登录记录数据获取成功',
        data: loginRecordsByDate
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

module.exports = { getLoginRecordService }
