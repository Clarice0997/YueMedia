const mongoose = require('mongoose')

const { hashSync } = require('bcrypt')

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
    type: String,
    set(val) {
      return hashSync(val, 10)
    }
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
