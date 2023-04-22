// import module
const { redisHandler } = require('../../config/redis')

/**
 * Redis Get
 * @param key
 * @returns {Promise<*>}
 */
async function getRedis(key) {
  try {
    const redis = await redisHandler()
    const data = await redis.get(key)
    redis.release()
    return data
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
 * @returns {Promise<boolean>}
 */
async function setRedis(key, value, flag = 'EX', timeout = 600) {
  try {
    const redis = await redisHandler()
    await redis.set(key, value, flag, timeout)
    await redis.release()
    return true
  } catch (err) {
    console.log(`Redis Set Error => ${err}`)
    throw err
  }
}

/**
 * Redis Del
 * @param key
 * @returns {Promise<boolean>}
 */
async function delRedis(key) {
  try {
    const redis = await redisHandler()
    await redis.del(key)
    await redis.release()
    return true
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
    const redis = await redisHandler()
    await redis.lpush(key, ...value)
    await redis.expire(key, 600)
    await redis.release()
    return true
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
    const redis = await redisHandler()
    await redis.rpush(key, ...value)
    await redis.expire(key, 600)
    await redis.release()
    return true
  } catch (err) {
    console.log(`Redis Rpush Error => ${err}`)
    throw err
  }
}

/**
 * Redis Lpop
 * @param key
 * @returns {Promise<*>}
 */
async function lpopRedis(key) {
  try {
    const redis = await redisHandler()
    const data = await redis.lpop(key)
    await redis.release()
    return data
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
    const redis = await redisHandler()
    const data = await redis.rpop(key)
    await redis.release()
    return data
  } catch (err) {
    console.log(`Redis Rpop Error => ${err}`)
    throw err
  }
}

/**
 * Redis Lindex
 * @param {*} key
 * @param {*} index
 * @returns
 */
async function lindexRedis(key, index) {
  try {
    const redis = await redisHandler()
    const data = await redis.lindex(key, index)
    await redis.release()
    return data
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
    const redis = await redisHandler()
    const data = await redis.llen(key)
    await redis.release()
    return data
  } catch (err) {
    console.log(`Redis Llen Error => ${err}`)
    throw err
  }
}

/**
 * Redis hset
 * @param key
 * @param field
 * @param value
 * @param timeout
 * @returns {Promise<boolean>}
 */
async function hsetRedis(key, field, value, timeout = 600) {
  try {
    const redis = await redisHandler()
    await redis.hset(key, field, value)
    await redis.expire(key, timeout)
    await redis.release()
    return true
  } catch (err) {
    console.log(`Redis Hset Error => ${err}`)
    throw err
  }
}

/**
 * Redis hget
 * @param key
 * @param field
 * @returns {Promise<*>}
 */
async function hgetRedis(key, field) {
  try {
    const redis = await redisHandler()
    const data = await redis.hget(key, field)
    await redis.release()
    return data
  } catch (err) {
    console.log(`Redis Hget Error => ${err}`)
    throw err
  }
}

/**
 * Redis hmset
 * @param key
 * @param obj
 * @param timeout
 * @returns {Promise<boolean>}
 */
async function hmsetRedis(key, obj, timeout = 600) {
  try {
    const redis = await redisHandler()
    await redis.hmset(key, obj)
    await redis.expire(key, timeout)
    await redis.release()
    return true
  } catch (err) {
    console.log(`Redis Hmset Error => ${err}`)
    throw err
  }
}

/**
 * Redis hmget
 * @param key
 * @param fields
 * @returns {Promise<{}>}
 */
async function hmgetRedis(key, fields) {
  try {
    const redis = await redisHandler()
    const values = await redis.hmget(key, fields)
    const obj = {}
    fields.forEach((field, i) => (obj[field] = values[i]))
    await redis.release()
    return obj
  } catch (err) {
    console.log(`Redis Hmget Error => ${err}`)
    throw err
  }
}

/**
 * Redis hgetall
 * @param key
 * @returns {Promise<*>}
 */
async function hgetallRedis(key) {
  try {
    const redis = await redisHandler()
    const obj = await redis.hgetall(key)
    await redis.release()
    return obj
  } catch (err) {
    console.log(`Redis Hgetall Error => ${err}`)
    throw err
  }
}

/**
 * Redis hdel
 * @param key
 * @param fields
 * @returns {Promise<boolean>}
 */
async function hdelRedis(key, ...fields) {
  try {
    const redis = await redisHandler()
    const result = await redis.hdel(key, ...fields)
    await redis.release()
    return result === fields.length
  } catch (err) {
    console.log(`Redis Hdel Error => ${err}`)
    throw err
  }
}

module.exports = {
  getRedis,
  setRedis,
  delRedis,
  lpushRedis,
  rpushRedis,
  lpopRedis,
  rpopRedis,
  lindexRedis,
  llenRedis,
  hsetRedis,
  hgetRedis,
  hmsetRedis,
  hmgetRedis,
  hgetallRedis,
  hdelRedis
}
