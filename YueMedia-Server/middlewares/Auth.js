// import modules
const { decryptJsonWebToken } = require('../utils/Jwt')

const authHandler = async (req, key = process.env.JWT_key) => {
  // 获取 JWT
  let authorization = req.headers.authorization
  // 判断 JWT 是否存在
  if (!authorization) {
    // 请求头中不存在则从 Cookie 中找 JWT
    const accessToken = req.cookies['Access-Token']
    if (!accessToken) {
      console.log('校验失败=>' + req.originalUrl)
      return false
    } else {
      authorization = `Bearer ${accessToken}`
    }
  }
  // 判断 JWT 是否合法
  try {
    const JsonWebToken = await decryptJsonWebToken(authorization.split(' ').pop(), key)
    if (JsonWebToken) {
      console.log(JsonWebToken.username + ' 校验通过=> ' + req.originalUrl)
      return JsonWebToken
    } else {
      console.log('校验失败=>' + req.originalUrl)
      return false
    }
  } catch (error) {
    console.log('校验失败=>' + req.originalUrl)
    return false
  }
}

// 普通用户校验中间件
const auth = async (req, res, next) => {
  const JsonWebToken = await authHandler(req)
  // 判断校验结果
  if (!JsonWebToken) {
    res.status(401).send({
      message: '身份验证失败'
    })
  } else {
    req.authorization = JsonWebToken
    await next()
  }
}

// 管理员校验中间件
const adminAuth = async (req, res, next) => {
  const JsonWebToken = await authHandler(req)
  // 判断校验结果
  if (!JsonWebToken) {
    res.status(401).send({
      message: '身份验证失败'
    })
  } else {
    // 判断用户角色
    if (JsonWebToken.type === 2 || JsonWebToken.type === 3) {
      req.authorization = JsonWebToken
      await next()
    } else {
      res.status(401).send({
        message: '身份验证失败'
      })
    }
  }
}

// 超级管理员校验中间件
const superAdminAuth = async (req, res, next) => {
  const JsonWebToken = await authHandler(req)
  // 判断校验结果
  if (!JsonWebToken) {
    res.status(401).send({
      message: '身份验证失败'
    })
  } else {
    // 判断用户角色
    if (JsonWebToken.type === 3) {
      req.authorization = JsonWebToken
      await next()
    } else {
      res.status(401).send({
        message: '身份验证失败'
      })
    }
  }
}

// 开放 API TOKEN 校验中间件
const openApiAuth = async (req, res, next) => {
  const JsonWebToken = await authHandler(req, process.env.OPEN_JWT_KEY)
  // 判断校验结果
  if (!JsonWebToken) {
    res.status(401).send({
      message: '身份验证失败'
    })
  } else {
    req.authorization = JsonWebToken
    next()
  }
}

module.exports = { auth, adminAuth, superAdminAuth, openApiAuth }
