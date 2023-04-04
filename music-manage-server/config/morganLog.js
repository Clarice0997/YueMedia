// import modules
const morgan = require('morgan')

// 定义 format 格式
const logFormat = ':method :url :status :res[content-length] :response-time'

// 定义 morgan 中间件
const morganLog = morgan(logFormat, {
  stream: {
    write: message => {
      try {
        const parts = message.trim().split(' ')

        const logObject = {
          method: parts[0],
          url: parts[1],
          status: parseInt(parts[2]),
          contentLength: parseInt(parts[3]),
          responseTime: `${parseFloat(parts[4])}`
        }

        require('../models/apiRecordModel').create(logObject)
      } catch (error) {
        console.error(error)
      }
    }
  }
})

module.exports = morganLog
