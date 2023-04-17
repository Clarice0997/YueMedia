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

/**
 * Save loginRecord
 * @param uno
 * @param username
 * @param loginIp
 * @returns {Promise<void>}
 */
async function loginRecord(uno, username, loginIp) {
  try {
    const loginRecord = new LoginRecord({
      uno,
      username,
      loginTime: new Date(),
      loginIp
    })
    await loginRecord.save()
  } catch (err) {
    console.error(err)
  }
}

module.exports = { LoginRecord, loginRecord }
