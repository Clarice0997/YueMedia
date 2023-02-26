const express = require('express')
const bodyParser = require('body-parser')

const app = express()

// 连接MongoDB数据库
require('./mongodb/mongodb')

// 导入跨域中间件
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')

  if (req.method == 'OPTIONS') {
    // 让options请求快速返回
    res.sendStatus(200)
  } else {
    next()
  }
})

// 处理body中间件
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// 路由
// 登录注册路由
app.use('/apis/admin', require('./api/admin'))
// 验证码路由
app.use('/apis/safecode', require('./api/safeCode'))

// 监听端口
app.listen(3000, err => {
  if (err) {
    throw err
  }

  console.log(`Server is running at http://localhost:3000`)
})
