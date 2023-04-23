// import modules
const mongoose = require('mongoose')

// TODO: 错误日志处理情况

const errorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  message: {
    type: String
  },
  from: {
    type: String,
    required: true
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
 * @param from
 * @param stack
 * @param ip
 * @returns {Promise<void>}
 */
async function errorRecord(name, message, from, stack, ip) {
  try {
    const errorRecord = new ErrorModel({
      name,
      message,
      from,
      stack,
      ip
    })
    await errorRecord.save()
  } catch (err) {
    console.error(err)
  }
}

module.exports = { ErrorModel, errorRecord }
