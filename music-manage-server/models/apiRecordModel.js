// import modules
const mongoose = require('mongoose')

const LogSchema = new mongoose.Schema({
  method: String,
  url: String,
  status: Number,
  ip: String,
  responseTime: Number,
  contentLength: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Log = mongoose.model('Log', LogSchema)

module.exports = Log
