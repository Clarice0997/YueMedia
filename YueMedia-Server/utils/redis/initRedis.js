// import modules
import { calculateLoginRecords } from './calculator/calculateLoginRecords'
import { calculateMusicConvertRecord } from './calculator/calculateMusicConvertRecord'
import { calculateUsersUsedStorage } from './calculator/calculateUserUsedStorage'
import { calculateUsersStorage } from './calculator/calculateUserStorage'

// 初始化
calculateLoginRecords()
calculateMusicConvertRecord()
calculateUsersUsedStorage()
calculateUsersStorage()

// 定时重新计算缓存
setInterval(async () => {
  await calculateLoginRecords()
  await calculateMusicConvertRecord()
  await calculateUsersUsedStorage()
  await calculateUsersStorage()
}, 2400 * 1000)
// 定时处理音频转码任务
require('./musicConvertProcess')
