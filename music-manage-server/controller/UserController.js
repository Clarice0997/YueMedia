// import module
const router = require('express').Router()
const { loginService, registerService } = require('../service/UserService')
const { auth } = require('../config/Auth')
const { errorHandler } = require('../config/ErrorCatcher')

/**
 * @api {POST} /apis/user/account/login 用户登录接口
 * @apiName login
 * @apiGroup User
 * @apiName User/login
 * @apiPermission All
 * @apiBody {String} username 账户名
 * @apiBody {String} password 密码
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
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {POST} /apis/user/account/register 用户注册接口
 * @apiName Register
 * @apiGroup User
 * @apiName User/Register
 * @apiPermission All
 * @apiBody {String} username 账户名
 * @apiBody {String} password 密码
 * @apiBody {String} nickname 昵称
 * @apiBody {String} phone 电话号码
 * @apiBody {String} email 邮箱
 */
router.post('/account/register', async (req, res) => {
  const body = req.body
  // Service
  try {
    const { code, data } = await registerService(body)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {GET} /apis/user/verify 用户权限校验接口
 * @apiName Verify
 * @apiGroup User
 * @apiName User/Verify
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/verify', auth, async (req, res) => {
  res.status(200).send({ message: '身份验证成功', code: 200 })
})

/**
 * @api {GET} /apis/user/account/profile 获取用户信息接口
 * @apiName GetProfile
 * @apiGroup User
 * @apiName User/GetProfile
 * @apiPermission User
 * @apiHeader {String} Authorization JWT鉴权
 */
router.get('/account/profile', auth, async (req, res) => {
  // 获取 authorization
  const authorization = req.authorization
  // 返回用户数据
  res.status(200).send({
    message: '用户数据获取成功',
    data: authorization
  })
})

module.exports = router
