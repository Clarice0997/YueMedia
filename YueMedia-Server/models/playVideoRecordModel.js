// import modules
const mongoose = require('mongoose')

const playVideoRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true
  },
  ip: {
    type: String,
    require: true
  },
  videoPath: {
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

const PlayVideoRecord = mongoose.model('play_video_records', playVideoRecordSchema)

module.exports = { PlayVideoRecord }
