// import modules
const jwt = require('jsonwebtoken')

/**
 * 生成 JWT
 * @param {*} payload
 * @returns
 */
const generateJsonWebToken = async payload => {
  return await jwt.sign(payload, process.env.JWT_key, { expiresIn: 3600 }, (err, token) => {
    if (err) throw new Error(err)
    return `Bearer ${token}`
  })
}

module.exports = { generateJsonWebToken }
