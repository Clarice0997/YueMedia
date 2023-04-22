// import modules
import { calculateLoginRecords } from './calculateLoginRecords'

// 初始化
calculateLoginRecords()

// 定时计算登录记录
setInterval(calculateLoginRecords, 2400 * 1000)
// 定时处理音频转码任务
require('./musicConvertProcess')
