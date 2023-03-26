const router = require('express').Router()
const bcrypt = require('bcrypt')

// 引入Date日期格式化
require('../utils/DateFormat')

// 数据库模型
const Admin = require('../dbModel/admin')

// JWT
const jwt = require('jsonwebtoken')

// 管理员登录
router.post('/account/login', (req, res) => {
  // 获取请求体中的数据 定义常量
  const email = req.body.email
  const password = req.body.password
  // 查找邮箱判断是否存在
  Admin.findOne({
    email: email
  }).then(admin => {
    // 判断登录用户是否存在
    if (admin) {
      // 数据库中的密码
      const dbPassword = admin.password
      // 密码匹配情况处理
      if (bcrypt.compareSync(password, dbPassword)) {
        // JWT 规则
        const JWT_RULE = {
          id: String(admin._id),
          email: admin.email,
          username: admin.username,
          data: admin.date,
          identity: admin.identity
        }
        // 生成JWT
        jwt.sign(JWT_RULE, process.env.JWT_key, { expiresIn: 3600 }, (err, token) => {
          if (err) {
            console.log('generate jwt error =>' + err)
            res.status(500).json({
              status: 500,
              result: 'unknown error!'
            })
          } else {
            res.status(200).json({
              status: 200,
              message: 'login success!',
              token: `Bearer ${token}`
            })
          }
        })
      } else {
        res.status(406).json({
          status: 406,
          message: 'error email or username!'
        })
      }
    } else {
      res.status(406).json({
        status: 406,
        message: 'error email or username!'
      })
    }
  })
})

/**
 * 管理员注册
 */
router.post('/account/register', (req, res) => {
  // 获取请求体数据 定义常量
  const email = req.body.email
  const username = req.body.username
  const password = req.body.password
  const identity = req.body.identity ? req.body.identity : null
  // 邮箱不重复
  Admin.findOne({
    email
  }).then(hasOne => {
    // 首先判断用户是否已存在 再判断冲突类型
    if (!hasOne) {
      // 获取当前时间对象
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
            result: 'register success!'
          })
        })
        .catch(err => {
          console.log('register save =>' + err.message)
          res.status(500).json({
            status: 500,
            result: 'unknown server error. register failed!'
          })
        })
    } else if (hasOne.username === username) {
      res.status(422).json({
        status: 422,
        result: 'username already exists!'
      })
    } else if (hasOne.email === email) {
      console.log(hasOne)
      res.status(422).json({
        status: 422,
        result: 'email already exists!'
      })
    }
  })
})

module.exports = router
