// import modules
const morgan = require('morgan')

// 定义 format 格式
const logFormat = ':method :url :remote-addr :status :res[content-length] :response-time'

// 定义 morgan 中间件
const morganLog = morgan(logFormat, {
  stream: {
    write: message => {
      try {
        const parts = message.trim().split(' ')

        const contentLength = parts[4] === '-' ? null : parseInt(parts[4])

        const logObject = {
          method: parts[0],
          url: parts[1],
          ip: parts[2],
          status: parseInt(parts[3]),
          contentLength: contentLength,
          responseTime: parseFloat(parts[5])
        }

        require('../models/apiRecordModel').create(logObject)
      } catch (error) {
        console.log(error)
      }
    }
  }
})

module.exports = morganLog
