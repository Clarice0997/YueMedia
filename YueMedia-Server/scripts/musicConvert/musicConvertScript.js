const { parentPort, workerData } = require('worker_threads')
const { convertAudio } = require('./convertAudio')
const { musicConvertErrorHandler } = require('../../middlewares/ErrorCatcher')

async function processAudioTask(taskId, audioTask) {
  convertAudio(taskId, audioTask.musicFileName, audioTask.originalName, audioTask.codec, audioTask.targetCodec)
    .then(({ outputFileName, taskDetail }) => {
      parentPort.postMessage({ status: true, message: 'Audio task processed successfully', outputFileName, taskDetail })
    })
    .catch(error => {
      musicConvertErrorHandler(error)
      parentPort.postMessage({ status: false, message: 'Audio task processed failed' })
    })
}

processAudioTask(workerData.taskId, workerData.audioTask)
