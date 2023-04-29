// import modules
const { hsetRedis } = require('../RedisHandler')
const { mysqlHandler } = require('../../../config/mysql')

// 计算单个用户存储容量使用情况
const calculateUserUsedStorage = async uno => {
  // 查询所有音频视频数据
  const musicData = await mysqlHandler('select * from music where upload_by = ?', [uno])
  const videoData = await mysqlHandler('select * from video where upload_by = ?', [uno])
  // 用于存储每个用户的空间使用情况
  let usersSpaceUsage = 0

  // 遍历音乐数据
  musicData.forEach(music => {
    const size = music.song_size
    if (usersSpaceUsage) {
      usersSpaceUsage += Number(size)
    } else {
      usersSpaceUsage = Number(size)
    }
  })

  // 遍历视频数据
  videoData.forEach(video => {
    const size = video.video_size
    if (usersSpaceUsage) {
      usersSpaceUsage += Number(size)
    } else {
      usersSpaceUsage = Number(size)
    }
  })

  // Redis storage
  await hsetRedis('user_used_storage', uno, usersSpaceUsage, 2400)
}

// 计算所有用户存储容量使用情况
const calculateUsersUsedStorage = async () => {
  // 查询所有音频视频数据
  const musicData = await mysqlHandler('select * from music')
  const videoData = await mysqlHandler('select * from video')
  const userData = await mysqlHandler('select * from users')
  // 用于存储每个用户的空间使用情况
  const usersSpaceUsage = {}

  // 遍历音乐数据
  musicData.forEach(music => {
    const userId = music.upload_by
    const size = music.song_size
    if (usersSpaceUsage[userId]) {
      usersSpaceUsage[userId] += Number(size)
    } else {
      usersSpaceUsage[userId] = Number(size)
    }
  })

  // 遍历视频数据
  videoData.forEach(video => {
    const userId = video.upload_by
    const size = video.video_size
    if (usersSpaceUsage[userId]) {
      usersSpaceUsage[userId] += Number(size)
    } else {
      usersSpaceUsage[userId] = Number(size)
    }
  })

  userData.forEach(user => {
    if (!usersSpaceUsage[user.uno]) {
      usersSpaceUsage[user.uno] = 0
    }
  })

  // 遍历每个用户空间使用情况 存入缓存
  const usersId = Object.keys(usersSpaceUsage)
  for (const userId of usersId) {
    // Redis storage
    await hsetRedis('user_used_storage', userId, usersSpaceUsage[userId], 2400)
  }
}

module.exports = { calculateUserUsedStorage, calculateUsersUsedStorage }
