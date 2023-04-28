const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()

// 导入环境变量
require('dotenv').config()

// 默认静态文件位置（可配置，默认与项目文件平级）
const path = require('path')
process.env.DEFAULT_STATIC_PATH = path.join(__dirname, '..', 'static')

// 默认项目根目录
process.env.DIRPATH = path.join(__dirname)

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
// 静态资源地址：http://localhost:3001
app.use(express.static('../static'))

// 绑定 apidoc 文档
// 接口文档地址：http://localhost:3001/apidoc
app.use('/apidoc', express.static('./doc/apidoc'))

// 第三方接口文档地址：http://localhost:3001/apidoc-open
app.use('/apidoc-open', express.static('./doc/open-apidoc'))

// 扫描文件夹，删除过期临时文件
require('./config/DelTempFile')

// 初始化 Redis 装载数据
require('./utils/redis/initRedis')

// 初始化定时任务
require('./utils/interval/initInterval')

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
// 音乐转换路由
app.use('/apis/convert', require('./controllers/MusicConvertController'))
// 错误记录路由
app.use('/apis/error', require('./controllers/ErrorHandlerController'))
// 下载路由
app.use('/apis/download', require('./controllers/DownloadController'))
// 开放API路由
app.use('/apis/openapi', require('./controllers/ApiController'))
// 文件路由
app.use('/apis/file', require('./controllers/FileController'))
// 视频路由
app.use('/apis/video', require('./controllers/VideoController'))
// 用户管理路由
app.use('/apis/userManager', require('./controllers/UserManagerController'))

// 连接测试接口
app.get('/', (req, res) => {
  res.send('Connect success!')
})

// 监听端口
app.listen(process.env.PORT, err => {
  if (err) {
    throw err
  }
  console.log(`Server is running at http://localhost:${process.env.PORT}`)
})
