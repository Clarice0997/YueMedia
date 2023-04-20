// import modules
const mongoose = require('mongoose')

const audioConvertQueueSchema = new mongoose.Schema({
  taskId: {
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

const AudioConvertQueues = mongoose.model('audio_convert_queues', audioConvertQueueSchema)

// 插入音频转码任务
async function insertAudioConvertQueues(taskId, tasks) {
  try {
    const audioConvertQueues = new AudioConvertQueues({ taskId, tasks, status: 1 })
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
