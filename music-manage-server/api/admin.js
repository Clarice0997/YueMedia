const router = require('express').Router()

// 引入Date日期格式化
require('../utils/DateFormat')

// 数据库模型
const Admin = require('../dbModel/admin')

// 管理员登录
router.post('/account/login', (req, res) => {
  // 获取请求体中的数据
  const email = req.body.email
  const password = req.body.password
  // 查找邮箱判断是否存在
  Admin.findOne({
    email: email
  }).then(admin => {
    if (admin) {
      // 数据库中的密码
      const dbPassword = admin.password
      const isValidPassword = dbPassword === password
      // 密码匹配情况处理
      if (isValidPassword) {
        res.status(200).json({
          status: 200,
          message: '登录成功',
          token: 'token'
        })
      } else {
        res.status(406).json({
          status: 406,
          message: '用户名或者密码错误'
        })
      }
    } else {
      res.status(406).json({
        status: 406,
        message: '用户名或者密码错误'
      })
    }
  })
})

/**
 * 管理员注册
 */
router.post('/account/register', (req, res) => {
  const email = req.body.email
  // 邮箱不重复
  Admin.findOne({
    email
  }).then(hasOne => {
    if (hasOne) {
      res.status(422).json({
        status: 422,
        result: '邮箱已存在！'
      })
    } else {
      const username = req.body.username
      const password = req.body.password
      const identity = req.body.identity ? req.body.identity : null
      const date = new Date().format('yyyy/MM/dd HH:mm:ss')

      // 新增文档
      const newAdmin = new Admin({
        email,
        username,
        password,
        identity,
        date
      })

      newAdmin
        .save()
        .then(() => {
          console.log('register success!')
          res.status(200).json({
            status: 200,
            result: '注册成功！'
          })
        })
        .catch(err => {
          console.log('register save =>' + err.message)
          res.status(500).json({
            status: 500,
            result: '服务器内部错误，注册失败！'
          })
        })
    }
  })
})

module.exports = router
