// import modules
const mongoose = require('mongoose')

const downloadRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true
  },
  ip: {
    type: String,
    require: true
  },
  downloadPath: {
    type: String,
    require: true
  },
  type: {
    type: String,
    default: 'Normal Download'
  },
  status: {
    type: Number,
    default: 0
  },
  fileSize: {
    type: Number,
    require: true
  },
  downloadStartTime: {
    type: Date
  },
  downloadEndTime: {
    type: Date
  },
  downloadDuration: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const DownloadRecord = mongoose.model('download_records', downloadRecordSchema)

module.exports = { DownloadRecord }
