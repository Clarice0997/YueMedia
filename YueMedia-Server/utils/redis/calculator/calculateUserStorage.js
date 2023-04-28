// import modules
const { hsetRedis } = require('../RedisHandler')
const { mysqlHandler } = require('../../../config/mysql')

// 计算单个用户存储容量
const calculateUserStorage = async uno => {
  // 查询用户数据
  const [userData] = await mysqlHandler('select * from users where uno = ?', [uno])

  // Redis storage
  await hsetRedis('user_storage', uno, userData.storage_size, 2400)
}

// 计算所有用户存储容量
const calculateUsersStorage = async () => {
  // 查询所有用户数据
  const userData = await mysqlHandler('select * from users')

  // Redis storage
  userData.forEach(user => {
    hsetRedis('user_storage', user.uno, user.storage_size, 2400)
  })
}

module.exports = { calculateUserStorage, calculateUsersStorage }
