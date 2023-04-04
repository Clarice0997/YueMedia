// import modules
const mongoose = require('mongoose')

const errorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
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

const ErrorModel = mongoose.model('error', errorSchema)

module.exports = ErrorModel
