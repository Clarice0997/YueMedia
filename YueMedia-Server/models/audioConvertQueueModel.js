// import modules
const mongoose = require('mongoose')
const moment = require('moment')

const audioConvertQueueSchema = new mongoose.Schema({
  taskId: {
    type: String,
    require: true
  },
  userId: {
    type: String,
    require: true
  },
  tasks: {
    type: Array,
    require: true
  },
  // 任务状态 1待处理 2处理完毕 3过期 4异常
  status: {
    type: Number,
    require: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    require: true
  },
  finishedAt: {
    type: Date
  }
})

// 处理时间 虚拟属性
audioConvertQueueSchema.virtual('processTime').get(function () {
  if (this.finishedAt) {
    const duration = moment.duration(moment(this.finishedAt).diff(moment(this.createdAt)))
    return duration.asMilliseconds()
  } else {
    return undefined
  }
})

// 过期状态改变 静态方法
audioConvertQueueSchema.statics.updateStatus = function () {
  const oneHour = 60 * 60 * 1000
  const now = new Date()
  this.find({
    status: 2,
    finishedAt: {
      $lt: new Date(now - oneHour)
    }
  })
    .updateMany({
      status: 3
    })
    .exec()
}

const AudioConvertQueues = mongoose.model('audio_convert_queues', audioConvertQueueSchema)

// 插入音频转码任务
async function insertAudioConvertQueues(taskId, tasks, userId) {
  try {
    const audioConvertQueues = new AudioConvertQueues({ taskId, tasks, userId, status: 1 })
    await audioConvertQueues.save()
  } catch (err) {
    console.error(err)
  }
}

// 更改音频转码任务状态
async function updateAudioConvertQueues(taskId, status, finishedAt) {
  try {
    return await AudioConvertQueues.findOneAndUpdate(
      { taskId },
      {
        status,
        finishedAt: finishedAt ? finishedAt : undefined
      },
      { new: true }
    )
  } catch (err) {
    console.error(err)
  }
}

module.exports = { AudioConvertQueues, insertAudioConvertQueues, updateAudioConvertQueues }
