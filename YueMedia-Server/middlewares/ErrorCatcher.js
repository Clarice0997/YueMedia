// import modules
const { errorRecord } = require('../models/errorRecordModel')

// 错误日志
const errorHandler = async (err, req, res) => {
  console.log('Normal Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  // Log the error to MongoDB
  await errorRecord(err.name, err.message, 'Normal Error', err.stack, req.ip)

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
  await errorRecord(err.name, err.message, 'Multer Error', err.stack, req.ip)

  // Send Multer error response to client
  res.status(400).json({ code: 400, message: err.message })
}

// Service 错误日志
const ServiceErrorHandler = async err => {
  console.log('Service Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  await errorRecord(err.name, err.message, 'Service Error', err.stack)
}

// MusicConvert 错误日志
const musicConvertErrorHandler = async err => {
  console.log('MusicConvert Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  await errorRecord(err.name, err.message, 'MusicConvert Error', err.stack)
}

// Download 错误日志
const downloadErrorHandler = async (err, ip) => {
  console.log('Download Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  await errorRecord(err.name, err.message, 'Download Error', err.stack, ip)
}

// PlayMusic 错误日志
const playMusicErrorHandler = async (err, ip) => {
  console.log('PlayMusic Error')
  console.log(err)
  console.log(err.name)
  console.log(err.message)
  await errorRecord(err.name, err.message, 'PlayMusic Error', err.stack, ip)
}

module.exports = {
  errorHandler,
  multerErrorHandler,
  ServiceErrorHandler,
  musicConvertErrorHandler,
  downloadErrorHandler,
  playMusicErrorHandler
}
