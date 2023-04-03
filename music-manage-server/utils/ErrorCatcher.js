// import modules
const ErrorModel = require('../dbModel/errorRecordModel')

// 错误日志
const errorHandler = (err, req, res) => {
  console.log('Normal Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
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

// Multer 错误日志
const multerErrorHandler = (err, req, res) => {
  console.log('Multer Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  // Log the Multer error to MongoDB
  const error = new ErrorModel({
    name: err.name,
    message: err.message,
    stack: err.stack
  })
  error.save()

  // Send Multer error response to client
  res.status(500).json({ code: 400, message: err.message })
}

// Service 错误日志
const ServiceErrorHandler = err => {
  console.log('Service Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  const error = new ErrorModel({
    name: err.name,
    message: err.message,
    stack: err.stack
  })
  error.save()
}

module.exports = { errorHandler, multerErrorHandler, ServiceErrorHandler }
