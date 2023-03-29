// import modules
const { decryptJsonWebToken } = require('../utils/Jwt')

// 校验中间件
const auth = async (req, res, next) => {
  // 获取 JWT
  const authorization = req.headers.authorization
  // 判断 JWT 是否存在
  if (!authorization) {
    console.log('校验失败=>' + req.originalUrl)
    res.status(401).send({
      message: '身份验证失败'
    })
    return
  }
  // 判断 JWT 是否合法
  try {
    const JsonWebToken = await decryptJsonWebToken(authorization.split(' ').pop())
    if (JsonWebToken) {
      console.log('校验通过=>' + req.originalUrl)
      req.authorization = JsonWebToken
      await next()
    } else {
      console.log('校验失败=>' + req.originalUrl)
      res.status(401).send({
        message: '身份验证失败'
      })
    }
  } catch (error) {
    console.log('校验失败=>' + req.originalUrl)
    res.status(401).send({
      message: '身份验证失败'
    })
  }
}

module.exports = { auth }
