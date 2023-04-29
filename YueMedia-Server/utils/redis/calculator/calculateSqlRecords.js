// import modules
const { hsetRedis } = require('../RedisHandler')
const { SqlRecord } = require('../../../models/sqlRecordModel')
const { formatDate } = require('../../formatDate')

// 计算 SQL 记录 Redis 持久化
const calculateSqlRecords = async () => {
  // 获取 Open API 调用情况数据
  let sqlData = await SqlRecord.find()
  // 构建返回数据
  let sqlLineResult = []
  let dateCountMap = {}

  if (sqlData.length !== 0) {
    for (let i = 0; i < sqlData.length; i++) {
      let item = sqlData[i]
      let date = formatDate(item.createdAt)

      // 统计每天的请求次数和响应时间
      if (!dateCountMap[date]) {
        dateCountMap[date] = { count: 0, responseTime: 0 }
      }
      if (!item.responseTime) {
        item.responseTime = 0
      }
      dateCountMap[date].count++
      dateCountMap[date].responseTime += item.responseTime
    }

    // 将统计结果转换成需要的数据结构
    for (let date in dateCountMap) {
      let count = dateCountMap[date].count
      let responseTime = dateCountMap[date].responseTime
      let averageResponseTime = responseTime / count
      sqlLineResult.push({
        date: date,
        count: count,
        averageResponseTime: averageResponseTime.toFixed(1)
      })
    }

    // 对数据进行排序
    sqlLineResult.sort((a, b) => a.date.localeCompare(b.date))

    // 对可能缺失的日期进行补全
    let startDate = new Date(sqlLineResult[0].date)
    let endDate = new Date(sqlLineResult[sqlLineResult.length - 1].date)

    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      let dateString = formatDate(date)
      if (!dateCountMap[dateString]) {
        sqlLineResult.push({ date: dateString, count: 0, averageResponseTime: 0 })
      }
    }
  }

  // Redis storage
  await hsetRedis('calculator', 'total_sql_record', JSON.stringify(sqlLineResult), 2400)
}

module.exports = { calculateSqlRecords }
