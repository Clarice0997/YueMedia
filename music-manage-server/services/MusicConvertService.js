// import modules

// 文件分析
const analyseFileService = async file => {
  try {
    const { originalname, encoding, mimetype, size } = file
    return {
      code: 200,
      data: { originalname, encoding, mimetype, size }
    }
  } catch (error) {
    console.log(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

module.exports = { analyseFileService }
