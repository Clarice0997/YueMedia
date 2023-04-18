const crypto = require('crypto')

/**
 * 生成 MD5
 * @param {*} fileBuffer
 * @returns
 */
const generateMD5 = async fileBuffer => {
  const hash = crypto.createHash('md5')
  hash.update(fileBuffer)
  return hash.digest('hex')
}

module.exports = { generateMD5 }
