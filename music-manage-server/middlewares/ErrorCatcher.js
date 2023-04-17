// import modules
const { errorRecord } = require('../models/errorRecordModel')

// 错误日志
const errorHandler = async (err, req, res) => {
  console.log('Normal Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  // Log the error to MongoDB
  await errorRecord(err.name, err.message, err.stack, req.ip)

  // Send error response to client
  res.status(500).json({ code: 500, message: '服务器内部错误' })
}

// Multer 错误日志
const multerErrorHandler = async (err, req, res) => {
  console.log('Multer Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  // Log the Multer error to MongoDB
  await errorRecord(err.name, err.message, err.stack, req.ip)

  // Send Multer error response to client
  res.status(400).json({ code: 400, message: err.message })
}

// Service 错误日志
const ServiceErrorHandler = async err => {
  console.log('Service Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  await errorRecord(err.name, err.message, err.stack)
}

module.exports = { errorHandler, multerErrorHandler, ServiceErrorHandler }
