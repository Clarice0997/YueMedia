// import modules
const { Worker } = require('worker_threads')
const { llenRedis, lpopRedis } = require('../RedisHandler')
const path = require('path')

// 全局标志变量
let timerId = null
let isProcessing = false

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
            audioTask: taskDetail.tasks[i]
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
              resolve(msg)
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
      Promise.all(promises).then(data => {
        // TODO: 判断完成情况，记录数据
        console.log(data)
      })
      console.log('All tasks processed successfully')
      isProcessing = false
      // 重启计时器
      timerId = setInterval(() => {
        processAudioQueue()
      }, 5000)
    } else {
      console.log('No tasks in queue')
    }
  } catch (error) {
    console.log(`Process Audio Queue Error => ${error}`)
  }
}

// 定时循环执行处理音频任务
timerId = setInterval(processAudioQueue, 5000)
