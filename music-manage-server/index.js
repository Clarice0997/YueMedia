const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

// 导入环境变量
require('dotenv').config()

// 连接 MySQL 数据库
require('./db/mysql')

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

// 绑定静态资源文件夹
// http://localhost:3000/
app.use(express.static('static'))

// 扫描文件夹，删除过期临时文件
require('./config/DelTempFile')

// 路由
// 登录注册路由
app.use('/apis/user', require('./controller/UserController'))
// 验证码路由
app.use('/apis/safecode', require('./controller/SafecodeController'))
// Vue路由
app.use('/apis/routes', require('./controller/RoutesController'))
// 音乐路由
app.use('/apis/music', require('./controller/MusicController'))
// 数据路由
app.use('/apis/data', require('./controller/DataController'))

// 监听端口
app.listen(process.env.PORT, err => {
  if (err) {
    throw err
  }
  console.log(`Server is running at http://localhost:${process.env.PORT}`)
})
