const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

// 导入环境变量
require('dotenv').config()

// 连接 MySQL 数据库
require('./config/mysql')

// 连接 MongoDB 数据库
require('./config/mongodb')

// 导入跨域中间件
require('./config/Cors')(app)

// 处理 Cookie 中间件
app.use(cookieParser())

// 处理 body 中间件
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 绑定静态资源文件夹
// 静态资源地址：http://localhost:3000/
app.use(express.static('static'))

// 绑定 apidoc 文档
// 接口文档地址：http://localhost:3000/apidoc
app.use('/apidoc', express.static('./doc/apidoc'))

// 扫描文件夹，删除过期临时文件
require('./config/DelTempFile')

// 使用 morgan 中间件记录日志
app.use(require('./config/morganLog'))

// 路由
// 登录注册路由
app.use('/apis/user', require('./controllers/UserController'))
// 验证码路由
app.use('/apis/safecode', require('./controllers/SafecodeController'))
// Vue路由
app.use('/apis/routes', require('./controllers/RoutesController'))
// 音乐路由
app.use('/apis/music', require('./controllers/MusicController'))
// 数据路由
app.use('/apis/data', require('./controllers/DataController'))

// 监听端口
app.listen(process.env.PORT, err => {
  if (err) {
    throw err
  }
  console.log(`Server is running at http://localhost:${process.env.PORT}`)
})
