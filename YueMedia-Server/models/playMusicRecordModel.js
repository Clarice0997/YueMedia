// import modules
const mongoose = require('mongoose')

const playMusicRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true
  },
  ip: {
    type: String,
    require: true
  },
  musicPath: {
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

const PlayMusicRecord = mongoose.model('play_music_records', playMusicRecordSchema)

module.exports = { PlayMusicRecord }
