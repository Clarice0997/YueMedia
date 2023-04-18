/**
 * 配置请求
 * 跨域
 * @param {*} app
 */
module.exports = app => {
  app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.AllowOrigin)
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild')
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') {
      // 让options请求快速返回
      res.sendStatus(200)
    } else {
      next()
    }
  })
}
