// import modules
import { calculateLoginRecords } from './calculateLoginRecords'
import { calculateMusicConvertRecord } from './calculateMusicConvertRecord'

// 初始化
calculateLoginRecords()
calculateMusicConvertRecord()

// 定时重新计算缓存
setInterval(async () => {
  await calculateLoginRecords()
  await calculateMusicConvertRecord()
}, 2400 * 1000)
// 定时处理音频转码任务
require('./musicConvertProcess')
