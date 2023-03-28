// import module
const router = require('express').Router()
const { loginService, registerService } = require('../service/UserService')

/**
 * 管理员登录
 */
router.post('/account/login', async (req, res) => {
  // 解构请求体
  const { username, password } = req.body
  // Service
  try {
    const { code, data } = await loginService(username, password, req.ip)
    // response
    res.status(code).send(data)
  } catch (err) {
    console.log(err)
  }
})

/**
 * 管理员注册
 */
router.post('/account/register', async (req, res) => {
  const body = req.body
  // Service
  try {
    const { code, data } = await registerService(body)
    // response
    res.status(code).send(data)
  } catch (err) {
    console.log(err)
  }
})

module.exports = router
