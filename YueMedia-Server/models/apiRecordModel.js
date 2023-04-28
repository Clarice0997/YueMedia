// import modules
const mongoose = require('mongoose')

const LogSchema = new mongoose.Schema({
  method: {
    type: String,
    require: true,
    description: '请求方法'
  },
  url: {
    type: String,
    require: true,
    description: '请求路径'
  },
  status: {
    type: Number,
    require: true,
    description: '状态码'
  },
  ip: {
    type: String,
    require: true,
    description: '请求IP'
  },
  responseTime: {
    type: Number,
    description: '响应时间'
  },
  contentLength: {
    type: String,
    description: '字长'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    description: '创建时间'
  }
})

const Log = mongoose.model('api_logs', LogSchema)

module.exports = Log
