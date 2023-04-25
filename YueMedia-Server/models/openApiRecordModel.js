// import modules
const mongoose = require('mongoose')

// TODO: 重构私有开放
const openApiRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true
  },
  ip: {
    type: String,
    require: true
  },
  path: {
    type: String,
    require: true
  },
  type: {
    type: String,
    require: true
  },
  status: {
    type: Number,
    default: 0
  },
  fileSize: {
    type: Number,
    require: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const OpenApiRecord = mongoose.model('open_api_records', openApiRecordSchema)

module.exports = { OpenApiRecord }
