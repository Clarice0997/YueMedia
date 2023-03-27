// 导入 Module
const redis = require('redis')
const { promisify } = require('util')
const { createPool } = require('generic-pool')

// 连接池配置
const redisPoolOption = {
  min: process.env.RedisPoolMin,
  max: process.env.RedisPoolMax
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
 * @param {*} flag 标志 (EX)
 * @param {*} timeout 过期时间 (seconds)
 */
const redisHandler = (type = 'get', key, value, mode = 'EX', timeout = 600) => {
  return redisPool.acquire().then(async client => {
    // 将 Redis 客户端封装为可重用的对象
    const redisAsync = {
      get: promisify(client.get).bind(client),
      set: promisify(client.set).bind(client),
      del: promisify(client.del).bind(client)
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
      default: {
        return new Error('Redis Type Error')
      }
    }
    // 将 Redis 客户端返回到连接池中
    redisPool.release(client)
    // 返回结果
    return result
  })
}

module.exports = { redisHandler }
