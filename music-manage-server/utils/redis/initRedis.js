// import modules
import { calculateLoginRecords } from './calculateLoginRecords'

// 初始化
calculateLoginRecords()

// 定时执行
setInterval(calculateLoginRecords, 2400 * 1000)
