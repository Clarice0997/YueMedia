// import module
const { redisHandler } = require('../config/redis')

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
 * @param key
 * @param value
 * @param flag
 * @param timeout
 * @returns {Promise<void>}
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

/**
 * Redis Lpush
 * @param {*} key
 * @param {*} value
 * @returns
 */
async function lpushRedis(key, ...value) {
  try {
    return redisHandler('lpush', key, value)
  } catch (err) {
    console.log(`Redis Lpush Error => ${err}`)
    throw err
  }
}

/**
 * Redis Rpush
 * @param {*} key
 * @param {*} value
 * @returns
 */
async function rpushRedis(key, ...value) {
  try {
    return redisHandler('rpush', key, value)
  } catch (err) {
    console.log(`Redis Rpush Error => ${err}`)
    throw err
  }
}

/**
 * Redis Lpop
 * @param {*} key
 * @returns
 */
async function lpopRedis(key) {
  try {
    return redisHandler('lpop', key)
  } catch (err) {
    console.log(`Redis Lpop Error => ${err}`)
    throw err
  }
}

/**
 * Redis Rpop
 * @param {*} key
 * @returns
 */
async function rpopRedis(key) {
  try {
    return redisHandler('rpop', key)
  } catch (err) {
    console.log(`Redis Rpop Error => ${err}`)
    throw err
  }
}

/**
 * Redis Lindex
 * @param {*} key
 * @param {*} value
 * @returns
 */
async function lindexRedis(key, value) {
  try {
    return redisHandler('lindex', key, value)
  } catch (err) {
    console.log(`Redis Lindex Error => ${err}`)
    throw err
  }
}

/**
 * Redis Llen
 * @param {*} key
 * @returns
 */
async function llenRedis(key) {
  try {
    return redisHandler('llen', key)
  } catch (err) {
    console.log(`Redis Llen Error => ${err}`)
    throw err
  }
}

module.exports = { getRedis, setRedis, delRedis, lpushRedis, rpushRedis, lpopRedis, rpopRedis, lindexRedis, llenRedis }
