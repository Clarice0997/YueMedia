// import modules
const mongoose = require('mongoose')

const LogSchema = new mongoose.Schema({
  method: {
    type: String,
    require: true
  },
  url: {
    type: String,
    require: true
  },
  status: {
    type: Number,
    require: true
  },
  ip: {
    type: String,
    require: true
  },
  responseTime: {
    type: Number
  },
  contentLength: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Log = mongoose.model('api_logs', LogSchema)

module.exports = Log
