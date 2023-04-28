// import modules
const { hsetRedis } = require('../RedisHandler')
const { AudioConvertRecord } = require('../../../models/audioConvertRecordModel')

// 计算音频转码记录 Redis 持久化
const calculateMusicConvertRecord = async () => {
  // 查询 MongoDB 转码记录
  const audioConvertRecord = await AudioConvertRecord.find({ type: 'musicConvertQueues' })
  // 计算
  const totalTasks = audioConvertRecord.length
  const totalSize = audioConvertRecord.reduce((acc, curr) => acc + curr.size, 0)
  const totalTime = audioConvertRecord.reduce((acc, curr) => acc + curr.convertTimeMS, 0)
  const averageSpeed = totalTime / totalTasks

  // Redis storage
  await hsetRedis(
    'calculator',
    'total_music_convert_record',
    JSON.stringify({
      totalTasks,
      totalSize,
      averageSpeed
    }),
    2400
  )
}

module.exports = { calculateMusicConvertRecord }
