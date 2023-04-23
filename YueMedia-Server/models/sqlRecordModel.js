// import modules
const mongoose = require('mongoose')

const sqlRecordSchema = new mongoose.Schema({
  sql: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  responseTime: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const SqlRecord = mongoose.model('sql_records', sqlRecordSchema)

module.exports = { SqlRecord }
