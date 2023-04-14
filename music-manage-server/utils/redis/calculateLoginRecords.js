// import modules
const { LoginRecord } = require('../../models/loginRecordModel')
const { setRedis } = require('../RedisHandler')

// 计算登录记录 Redis持久化
const calculateLoginRecords = async () => {
  const loginRecords = await LoginRecord.find({})
  const loginDates = loginRecords.map(loginRecord => {
    const year = loginRecord.loginTime.getFullYear()
    const month = loginRecord.loginTime.getMonth() + 1
    const day = loginRecord.loginTime.getDate()
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`
  })
  const loginRecordsByDate = loginDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})
  const handledLoginRecords = Object.entries(loginRecordsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
  // Redis storage
  await setRedis('calculate_login_record', JSON.stringify(handledLoginRecords))
}

module.exports = { calculateLoginRecords }
