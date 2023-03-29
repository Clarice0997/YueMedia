// import module
const router = require('express').Router()
const { loginService, registerService } = require('../service/UserService')
const { auth } = require('../config/Auth')

/**
 * 用户登录
 */
router.post('/account/login', async (req, res) => {
  // 解构请求体
  const { username, password } = req.body
  // Service
  try {
    const { code, data } = await loginService(username, password, req.ip)
    // response
    // set JsonWebToken
    if (data.token) res.cookie('Access-Token', data.token)
    res.status(code).send({ ...data, code })
  } catch (err) {
    console.log(err)
  }
})

/**
 * 用户注册
 */
router.post('/account/register', async (req, res) => {
  const body = req.body
  // Service
  try {
    const { code, data } = await registerService(body)
    // response
    res.status(code).send({ ...data, code })
  } catch (err) {
    console.log(err)
  }
})

/**
 * 身份校验接口
 */
router.get('/verify', auth, async (req, res) => {
  await res.status(200).send({ message: '身份验证成功', code: 200 })
})

module.exports = router
