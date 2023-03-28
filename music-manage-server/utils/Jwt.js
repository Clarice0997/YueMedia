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

/**
 * 解密 JWT
 * @param {*} token
 * @returns
 */
const decryptJsonWebToken = async token => {
  return jwt.verify(token, process.env.JWT_key)
}

module.exports = { generateJsonWebToken, decryptJsonWebToken }
