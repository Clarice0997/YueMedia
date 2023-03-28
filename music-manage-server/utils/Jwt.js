// import modules
const jwt = require('jsonwebtoken')

/**
 * 生成 JWT
 * @param {*} payload
 * @returns
 */
const generateJsonWebToken = async payload => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_key, { expiresIn: 3600 }, (err, token) => {
      if (err) reject(err)
      resolve(`Bearer ${token}`)
    })
  })
}

module.exports = { generateJsonWebToken }
