// import module
const mysql = require('mysql')

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

// TODO: SQL语句响应状态记录

// MySQL Handler
const mysqlHandler = async (sql, value) => {
  // 从连接池中获取连接
  return new Promise(async (resolve, reject) => {
    try {
      await MySQLConnectionPool.getConnection(async (err, connection) => {
        if (err) throw new Error(err)
        await connection.query(sql, value, async (err, result) => {
          console.log(sql)
          if (err) throw new Error(err)
          let data = await transformResult(result)
          connection.release()
          resolve(data)
        })
      })
    } catch (err) {
      reject(err)
    }
  })
}

// 导出模块
module.exports = { mysqlHandler }
