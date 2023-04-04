// import modules
const mongoose = require('mongoose')

const loginRecordSchema = new mongoose.Schema({
  uno: {
    require: true,
    type: String
  },
  username: {
    require: true,
    type: String
  },
  loginTime: {
    require: true,
    type: Date
  },
  loginIp: {
    require: true,
    type: String
  }
})

const LoginRecord = mongoose.model('login_records', loginRecordSchema)

module.exports = { LoginRecord }
