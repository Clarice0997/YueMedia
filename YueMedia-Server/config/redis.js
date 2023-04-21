// 导入 Module
const redis = require('redis')
const { promisify } = require('util')
const { createPool } = require('generic-pool')

// 连接池配置
const redisPoolOption = {
  min: process.env.RedisPoolMin ? process.env.RedisPoolMin : 4,
  max: process.env.RedisPoolMax ? process.env.RedisPoolMax : 8
}

// 创建 Redis 连接池
const redisPool = createPool(
  {
    create: () =>
      redis.createClient({
        host: process.env.RedisHost ? process.env.RedisHost : undefined,
        port: process.env.RedisPort ? process.env.RedisPort : undefined,
        user: process.env.RedisUser ? process.env.RedisUser : undefined,
        password: process.env.RedisPassword ? process.env.RedisPassword : undefined
      }),
    destroy: client => client.quit()
  },
  redisPoolOption
)

/**
 * 封装 Redis Promise API
 *
 * @param {*} type 请求类型 (get|set|del)
 * @param {*} key 键
 * @param {*} value 值
 * @param {*} mode 标志 (EX)
 * @param {*} timeout 过期时间 (seconds)
 */
// TODO: 过期时间
const redisHandler = (type = 'get', key, value, mode = 'EX', timeout = 600) => {
  return redisPool.acquire().then(async client => {
    // 将 Redis 客户端封装为可重用的对象
    const redisAsync = {
      get: promisify(client.get).bind(client),
      set: promisify(client.set).bind(client),
      del: promisify(client.del).bind(client),
      lpush: promisify(client.lpush).bind(client),
      rpush: promisify(client.rpush).bind(client),
      lpop: promisify(client.lpop).bind(client),
      rpop: promisify(client.rpop).bind(client),
      lindex: promisify(client.lindex).bind(client),
      llen: promisify(client.llen).bind(client),
      hset: promisify(client.hset).bind(client),
      hget: promisify(client.hget).bind(client),
      hmset: promisify(client.hmset).bind(client),
      hmget: promisify(client.hmget).bind(client),
      hgetall: promisify(client.hgetall).bind(client),
      hdel: promisify(client.hdel).bind(client),
      persist: promisify(client.persist).bind(client)
    }

    let result
    // 判断请求类型
    switch (type) {
      case 'get': {
        await redisAsync
          .get(key)
          .then(value => {
            result = value
          })
          .catch(err => {
            console.log(`Redis Get Error => ${err}`)
          })
        break
      }
      case 'set': {
        await redisAsync
          .set(key, value, mode, timeout)
          .then(value => {
            result = value
          })
          .catch(err => {
            console.log(`Redis Set Error => ${err}`)
          })
        break
      }
      case 'del': {
        await redisAsync
          .del(key)
          .then(value => {
            result = value
          })
          .catch(err => {
            console.log(`Redis Del Error => ${err}`)
          })
        break
      }
      case 'lpush': {
        await redisAsync
          .lpush(key, ...value)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Lpush Error => ${err}`)
          })
        break
      }
      case 'rpush': {
        await redisAsync
          .rpush(key, ...value)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Rpush Error => ${err}`)
          })
        break
      }
      case 'lpop': {
        await redisAsync
          .lpop(key)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Lpop Error => ${err}`)
          })
        break
      }
      case 'rpop': {
        await redisAsync
          .rpop(key)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Rpop Error => ${err}`)
          })
        break
      }
      case 'lindex': {
        await redisAsync
          .lindex(key, value)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Lindex Error => ${err}`)
          })
        break
      }
      case 'llen': {
        await redisAsync
          .llen(key)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Llen Error => ${err}`)
          })
        break
      }
      case 'hset': {
        await redisAsync
          .hset(key, ...value)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Hset Error => ${err}`)
          })
        break
      }
      case 'hget': {
        await redisAsync
          .hget(key, value)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Hget Error => ${err}`)
          })
        break
      }
      case 'hmset': {
        await redisAsync
          .hmset(key, ...value)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Hmset Error => ${err}`)
          })
        break
      }
      case 'hmget': {
        await redisAsync
          .hmget(key, ...value)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Hmget Error => ${err}`)
          })
        break
      }
      case 'hgetall': {
        await redisAsync
          .hgetall(key)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Hgetall Error => ${err}`)
          })
        break
      }
      case 'hdel': {
        await redisAsync
          .hdel(key, ...value)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis Hdel Error => ${err}`)
          })
        break
      }
      case 'persist': {
        await redisAsync
          .persist(key, value)
          .then(reply => {
            result = reply
          })
          .catch(err => {
            console.log(`Redis persist Error => ${err}`)
          })
      }
      default: {
        return new Error('Redis Type Error')
        break
      }
    }
    // 将 Redis 客户端返回到连接池中
    await redisPool.release(client)
    // 返回结果
    return result
  })
}

module.exports = { redisHandler }
