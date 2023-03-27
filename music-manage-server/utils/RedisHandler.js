// import module
const { redisHandler } = require('../db/redis')

/**
 * Redis Get
 * @param {*} key
 */
async function getRedis(key) {
  try {
    return redisHandler('get', key)
  } catch (err) {
    console.log(`Redis Get Error => ${err}`)
    throw err
  }
}

/**
 * Redis Set
 * @param {*} key
 * @param {*} value
 */
async function setRedis(key, value, flag = 'EX', timeout = 600) {
  try {
    await redisHandler('set', key, value, flag, timeout)
  } catch (err) {
    console.log(`Redis Set Error => ${err}`)
    throw err
  }
}

/**
 * Redis Del
 * @param {*} key
 * @returns
 */
async function delRedis(key) {
  try {
    return redisHandler('del', key)
  } catch (err) {
    console.log(`Redis Del Error => ${err}`)
    throw err
  }
}

module.exports = { getRedis, setRedis, delRedis }
