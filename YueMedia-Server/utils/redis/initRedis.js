// import modules
import { calculateLoginRecords } from './calculateLoginRecords'
import { persistRedis } from './RedisHandler'

// 初始化
calculateLoginRecords()
// 设置超时时间
persistRedis('calculate_login_record', 5)

// 定时计算登录记录
setInterval(calculateLoginRecords, 2400 * 1000)
// 定时处理音频转码任务
require('./musicConvertProcess')
