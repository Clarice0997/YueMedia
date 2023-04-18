// import modules
const mongoose = require('mongoose')

const errorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  ip: {
    type: String
  },
  stack: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

const ErrorModel = mongoose.model('error_records', errorSchema)

/**
 * Save Error
 * @param name
 * @param message
 * @param stack
 * @param ip
 * @returns {Promise<void>}
 */
async function errorRecord(name, message, stack, ip) {
  try {
    const errorRecord = new ErrorModel({
      name,
      message,
      stack,
      ip
    })
    await errorRecord.save()
  } catch (err) {
    console.error(err)
  }
}

module.exports = { ErrorModel, errorRecord }
