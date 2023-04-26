// import modules
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { ErrorModel } = require('../models/errorRecordModel')

/**
 * 获取所有未处理错误 Service
 * @returns
 */
const getErrorsSerivce = async errorType => {
  try {
    const errors = await ErrorModel.find({ status: { $in: [errorType] } }).sort({ date: 'desc' })
    // return
    return {
      data: {
        message: '错误记录获取成功',
        errors
      },
      code: 200
    }
  } catch (error) {
    ServiceErrorHandler(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

/**
 * 处理错误 Service
 * @param id
 * @param status
 * @returns
 */
const updateErrorService = async (id, status) => {
  try {
    // 检查参数
    if (!(id && status))
      return {
        data: {
          message: '参数不合法'
        },
        code: 400
      }
    // 修改状态
    await ErrorModel.findOneAndUpdate({ _id: id }, { status: status })
    // return
    return {
      data: {
        message: '错误记录状态更改成功'
      },
      code: 200
    }
  } catch (error) {
    ServiceErrorHandler(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

module.exports = { getErrorsSerivce, updateErrorService }
