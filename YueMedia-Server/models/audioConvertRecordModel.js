// import modules
const mongoose = require('mongoose')

const audioConvertSchema = new mongoose.Schema({
  songId: {
    type: String,
    require: true
  },
  type: {
    type: String,
    require: true
  },
  originCodec: {
    type: String,
    require: true
  },
  targetCodec: {
    type: String,
    require: true
  },
  convertTimeMS: {
    type: Number,
    require: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const AudioConvertRecord = mongoose.model('audio_convert_records', audioConvertSchema)

/**
 * audioConvertRecord
 * @param songId
 * @param type
 * @param originCodec
 * @param targetCodec
 * @param convertTimeMS
 * @returns {Promise<void>}
 */
async function audioConvertRecord(songId, type, originCodec, targetCodec, convertTimeMS) {
  try {
    const audioConvertRecord = new AudioConvertRecord({
      songId,
      type,
      originCodec,
      targetCodec,
      convertTimeMS
    })
    await audioConvertRecord.save()
  } catch (err) {
    console.error(err)
  }
}

module.exports = { AudioConvertRecord, audioConvertRecord }
