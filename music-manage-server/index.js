const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

// 导入环境变量
require('dotenv').config()

// 连接 MongoDB 数据库
require('./db/mongodb')

// 导入跨域中间件
require('./config/Cors')(app)

// 处理 Cookie 中间件
app.use(cookieParser())

// 处理 body 中间件
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 路由
// 登录注册路由
app.use('/apis/admin', require('./controller/AdminController'))
// 验证码路由
app.use('/apis/safecode', require('./controller/SafecodeController'))

// 监听端口
app.listen(process.env.PORT, err => {
  if (err) {
    throw err
  }
  console.log(`Server is running at http://localhost:${process.env.PORT}`)
})
