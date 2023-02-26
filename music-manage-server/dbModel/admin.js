const mongoose = require('mongoose')

const adminModel = mongoose.Schema({
  email: {
    require: true,
    type: String
  },
  username: {
    require: true,
    type: String
  },
  password: {
    require: true,
    type: String
  },
  identity: {
    require: true,
    type: String
  },
  date: {
    require: true,
    type: String
  }
})

module.exports = mongoose.model('Admin', adminModel)
