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
 */
const redisHandler = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await redisPool.acquire()
      resolve({
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
        expire: promisify(client.expire).bind(client),
        release: promisify(redisPool.release).bind(client)
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { redisHandler }
