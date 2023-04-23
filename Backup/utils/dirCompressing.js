// 压缩包模块 （原生写法）
// 创建可写流 & zlib压缩流 & tar打包流
// const outputDirWriteStream = fs.createWriteStream(path.join(DEFAULT_STATIC_PATH, CONVERT_MUSIC_FOLDER, `${taskDetail.taskId}.tar.gz`))
// const gzip = zlib.createGzip()
// const pack = tar.create({
//   gzip: true,
//   // 设置当前工作目录
//   cwd: outputDir,
//   // 可移植性更好
//   portable: true
// })
// // 可读流通过管道流到压缩流 压缩流通过管道流到可写流
// pack.pipe(gzip).pipe(outputDirWriteStream)
// // 监听压缩完成事件 关闭可读流 & 可写流 删除原文件夹
// outputDirWriteStream.on('finish', () => {
//   fs.rmdirSync(outputDir)
// })
// outputDirWriteStream.end()
