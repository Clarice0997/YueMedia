// import modules
const { AudioConvertQueues } = require('../../models/audioConvertQueueModel')

// 预触发
AudioConvertQueues.updateStatus()

// 过期状态改变
setInterval(() => {
  AudioConvertQueues.updateStatus()
}, 60 * 60 * 1000)
