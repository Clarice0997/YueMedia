// import modules
const { Worker } = require('worker_threads')
const { llenRedis, lpopRedis } = require('./RedisHandler')
const path = require('path')
const { updateAudioConvertQueues } = require('../../models/audioConvertQueueModel')
const { audioConvertRecord } = require('../../models/audioConvertRecordModel')
const { calculateMusicConvertRecord } = require('./calculator/calculateMusicConvertRecord')
const fs = require('fs')
const fsPlus = require('fs-extra')
const { dirCompressing } = require('../dirCompressing')
const { musicConvertErrorHandler } = require('../../middlewares/ErrorCatcher')

// 全局标志变量
let timerId = null
let isProcessing = false

// Path
const DEFAULT_STATIC_PATH = process.env.DEFAULT_STATIC_PATH
const CONVERT_MUSIC_FOLDER = process.env.CONVERT_MUSIC_FOLDER

/**
 * 从 Redis 队列中取出并处理音频任务
 */
async function processAudioQueue() {
  // 队列键名
  const queueKey = 'music_convert_tasks'
  // 判断是否正在运行 不抢占进程
  if (isProcessing) {
    console.log('Processing task, skip this cycle')
    return
  }
  try {
    // 任务队列长度
    const queueLength = await llenRedis(queueKey)
    // 判断队列中是否存在数据
    if (queueLength > 0) {
      // 程序运行表示
      isProcessing = true
      // 如果存在计时器 清除计时器
      if (timerId) {
        clearInterval(timerId)
        timerId = null
      }
      // 取出队列值
      let task = await lpopRedis(queueKey)
      task = JSON.parse(task)
      // 取出任务清单
      const taskDetail = task.task
      // 初始化线程池
      const workerPool = []
      // 最大线程数
      const maxThreads = 5
      // 当前线程数
      let currentThreads = 0
      const outputDir = path.join(DEFAULT_STATIC_PATH, CONVERT_MUSIC_FOLDER, taskDetail.taskId)
      fs.mkdirSync(outputDir)
      // 分配线程
      for (let i = 0; i < taskDetail.tasks.length; i++) {
        // 判断是否有空闲线程
        if (currentThreads >= maxThreads) {
          // 等待线程池中的线程结束
          await Promise.race(workerPool.map(worker => new Promise(resolve => worker.once('exit', resolve))))
          currentThreads--
        }
        // 新线程 携带参数
        const scriptPath = path.join(process.env.DIRPATH, 'scripts', 'musicConvert', 'musicConvertScript.js')
        const worker = new Worker(scriptPath, {
          workerData: {
            taskId: taskDetail.taskId,
            audioTask: taskDetail.tasks[i],
            outputDir
          }
        })
        workerPool.push(worker)
        currentThreads++
      }
      // 等待所有线程处理结束
      const promises = workerPool.map(worker => {
        return new Promise((resolve, reject) => {
          // 转码成功返回消息 判断消息类型
          worker.on('message', message => {
            const { status, message: msg } = message
            if (status) {
              resolve(message)
            } else {
              reject(msg)
            }
          })
          worker.on('error', reject)
          worker.on('exit', code => {
            if (code !== 0) {
              reject(new Error(`Worker stopped with exit code ${code}`))
            }
          })
        })
      })
      Promise.all(promises)
        .then(async datas => {
          if (datas.every(data => data.status)) {
            // 更新状态
            await updateAudioConvertQueues(taskDetail.taskId, 2, new Date())
            await datas.forEach(data => {
              const { songId, type, size, originCodec, targetCodec, convertTimeMS } = data.taskDetail
              // 保存音频转换记录
              audioConvertRecord(songId, type, size, originCodec, targetCodec, convertTimeMS)
            })
            // 任务输出压缩包
            await dirCompressing(outputDir, path.join(DEFAULT_STATIC_PATH, CONVERT_MUSIC_FOLDER, `${taskDetail.taskId}.zip`), 'zip')
            // 删除原文件夹
            fsPlus.removeSync(outputDir)
          } else {
            await updateAudioConvertQueues(taskDetail.taskId, 4, new Date())
          }
        })
        .catch(async error => {
          await musicConvertErrorHandler(error)
          await updateAudioConvertQueues(taskDetail.taskId, 4, new Date())
        })
        .finally(async () => {
          // 更新 Redis 总音乐转换数据缓存
          await calculateMusicConvertRecord()
        })
      isProcessing = false
      // 重启计时器
      timerId = setInterval(() => {
        processAudioQueue()
      }, 5000)
    }
  } catch (error) {
    console.log(`Process Audio Queue Error => ${error}`)
  }
}

// 定时循环执行处理音频任务
timerId = setInterval(processAudioQueue, 5000)
