// import modules
const { decryptJsonWebToken } = require('../utils/Jwt')

// 校验中间件
const auth = async (req, res, next) => {
  // 获取 JWT
  const authorization = req.headers.authorization
  // 判断 JWT 是否存在
  if (!authorization) {
    res.status(401).send({
      message: '身份验证失败'
    })
  }
  // 判断 JWT 是否合法
  try {
    const JsonWebToken = await decryptJsonWebToken(authorization)
    if (JsonWebToken) {
      req.JsonWebToken = JsonWebToken
      await next()
    } else {
      res.status(401).send({
        message: '身份验证失败'
      })
    }
  } catch (error) {
    res.status(401).send({
      message: '身份验证失败'
    })
  }
}

module.exports = { auth }
