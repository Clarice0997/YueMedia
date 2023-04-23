// import modules
const compressing = require('compressing')

// 文件夹压缩处理函数
const dirCompressing = (inputDirPath, outputDirPath, type = 'zip') => {
  return new Promise((resolve, reject) => {
    switch (type) {
      case 'zip':
        compressing.zip
          .compressDir(inputDirPath, outputDirPath)
          .then(() => {
            resolve(true)
          })
          .catch(error => {
            reject(error)
          })
        break
      case 'tar':
        compressing.tar
          .compressDir(inputDirPath, outputDirPath)
          .then(() => {
            resolve(true)
          })
          .catch(error => {
            reject(error)
          })
        break
      case 'tgz':
        compressing.tgz
          .compressDir(inputDirPath, outputDirPath)
          .then(() => {
            resolve(true)
          })
          .catch(error => {
            reject(error)
          })
        break
      default:
        reject('Unrecognized Compressing Type')
    }
  })
}

module.exports = { dirCompressing }
