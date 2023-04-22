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
      await redisPool.acquire().then(async client => {
        resolve({
          exists: await promisify(client.exists).bind(client),
          get: await promisify(client.get).bind(client),
          set: await promisify(client.set).bind(client),
          del: await promisify(client.del).bind(client),
          lpush: await promisify(client.lpush).bind(client),
          rpush: await promisify(client.rpush).bind(client),
          lpop: await promisify(client.lpop).bind(client),
          rpop: await promisify(client.rpop).bind(client),
          lindex: await promisify(client.lindex).bind(client),
          llen: await promisify(client.llen).bind(client),
          hset: await promisify(client.hset).bind(client),
          hget: await promisify(client.hget).bind(client),
          hmset: await promisify(client.hmset).bind(client),
          hmget: await promisify(client.hmget).bind(client),
          hgetall: await promisify(client.hgetall).bind(client),
          hdel: await promisify(client.hdel).bind(client),
          expire: await promisify(client.expire).bind(client),
          release: async () => {
            await redisPool.release(client)
          }
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { redisHandler }
