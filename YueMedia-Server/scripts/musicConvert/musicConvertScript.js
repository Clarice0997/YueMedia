const { parentPort, workerData } = require('worker_threads')
const { convertAudio } = require('./convertAudio')

async function processAudioTask(taskId, audioTask) {
  convertAudio(taskId, audioTask.musicFileName, audioTask.originalName, audioTask.codec, audioTask.targetCodec)
    .then(() => {
      parentPort.postMessage({ status: true, message: 'Audio task processed successfully' })
    })
    .catch(error => {
      // TODO: 错误捕获
      console.log(error)
      parentPort.postMessage({ status: false, message: 'Audio task processed failed' })
    })
}

processAudioTask(workerData.taskId, workerData.audioTask)
