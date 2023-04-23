// import module
const mysql = require('mysql')
const { SqlRecord } = require('../models/sqlRecordModel')

// mysql pool
const MySQLConnectionPool = mysql.createPool({
  host: process.env.MySQLHost,
  port: Number(process.env.MySQLPort),
  user: process.env.MySQLUser,
  password: process.env.MySQLPassword,
  database: process.env.MySQLDatabase,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

MySQLConnectionPool.on('connection', connection => {
  connection.query('SET SESSION wait_timeout = 28800')
  connection.query('SET NAMES utf8mb4')
})

MySQLConnectionPool.on('enqueue', () => {
  console.log('数据库连接池已满')
})

MySQLConnectionPool.on('release', () => {})

MySQLConnectionPool.on('error', err => {
  console.error('MySQL error: ', err)
})

// 判断连接池的启动状态
if (MySQLConnectionPool) console.log(`MySQL has been connected. Database name: ${process.env.MySQLDatabase}`)

// 查询结果转换函数
function transformResult(result) {
  result = JSON.stringify(result)
  result = JSON.parse(result)
  return result
}

// MySQL Handler
const mysqlHandler = async (sql, value) => {
  // 从连接池中获取连接
  return new Promise(async (resolve, reject) => {
    try {
      await MySQLConnectionPool.getConnection(async (err, connection) => {
        if (err) throw new Error(err)
        // 记录开始时间
        const startTime = Date.now()
        await connection.query(sql, value, async (err, result) => {
          // 记录结束时间
          const endTime = Date.now()
          if (err) {
            // SQL 响应时间
            const responseTime = endTime - startTime
            // 保存 SQL 记录
            const newSqlRecord = new SqlRecord({
              sql,
              status: 'failure',
              responseTime
            })
            await newSqlRecord.save()
            throw new Error(err)
          }
          let data = await transformResult(result)
          connection.release()
          resolve(data)
          // SQL 响应时间
          const responseTime = endTime - startTime
          // 保存 SQL 记录
          const newSqlRecord = new SqlRecord({
            sql,
            status: 'success',
            responseTime
          })
          await newSqlRecord.save()
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}

// 导出模块
module.exports = { mysqlHandler }
