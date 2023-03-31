// import modules
const ErrorModel = require('../dbModel/errorRecordModel')

// 错误日志
const errorHandler = (err, req, res, next) => {
  console.log(err)
  // Log the error to MongoDB
  const error = new ErrorModel({
    name: err.name,
    message: err.message,
    stack: err.stack
  })
  error.save()

  // Send error response to client
  res.status(500).json({ code: 500, message: '服务器内部错误' })
}

module.exports = errorHandler
