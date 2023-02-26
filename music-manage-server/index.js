const express = require('express')
const bodyParser = require('body-parser')

const app = express()

// 连接MongoDB数据库
require('./mongodb/mongodb')

// 处理body中间件
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 路由
// 登录注册路由
app.use('/api/admin', require('./api/admin'))
// 验证码路由
app.use('/api/safecode', require('./api/safeCode'))

// 监听端口
app.listen(3000, err => {
  if (err) {
    throw err
  }

  console.log(`Server is running at http://localhost:3000`)
})
