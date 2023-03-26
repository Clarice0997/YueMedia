// 导入 Redis

const redis = require('redis')
const client = redis.createClient({
  url: 'redis://localhost:6379/0'
})

// let setKey = (key, value) => {
//   return new Promise((resolve, reject) => {
//     client.set(key, value, (err, replay) => {
//       if (err) {
//         reject(err)
//       } else {
//         resolve(replay)
//       }
//     })
//   })
// }

// let getKey = key => {
//   return new Promise((resolve, reject) => {
//     client.get(key, (err, replay) => {
//       if (err) {
//         reject(err)
//       } else {
//         resolve(replay)
//       }
//     })
//   })
// }

// module.exports = {
//   setKey,
//   getKey
// }

// 创建 Redis 连接池
// const redisPool = createPool({
//   create: () => redis.createClient(),
//   destroy: redisClient => redisClient.quit()
// })

// redis 操作对象
// class RedisHandle {
//   constructor() {
//     this.redisClient = redis.createClient({
//       host: process.env.RedisHost,
//       port: process.env.RedisPort,
//       password: process.env.RedisPassword
//     })
//     this.redisClient.connect()
//     this.redisClient.ping((err, result) => {
//       console.log(result)
//     })
//   }
//   getKey(key) {
//     let result
//     this.redisClient.get(key, (err, value) => {
//       if (err) console.log('getKeyError=>' + err)
//       result = value
//     })
//     // 返回查询结果
//     return result
//   }
//   setKey(key, value) {
//     this.redisClient.set(key, value, (err, result) => {
//       if (err) console.log('setKeyError=>' + err)
//     })
//   }
// }
