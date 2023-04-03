// 自定义 ffmpeg 错误
class ffmpegError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ffmpegError'
  }
}

module.exports = ffmpegError
