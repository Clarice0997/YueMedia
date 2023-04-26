// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 获取错误列表 API
 * @param errorType
 * @returns
 */
export const getErrorsAPI = async errorType => {
  return request.get('/apis/error/errors', {
    params: { errorType }
  })
}

/**
 * 处理错误 API
 * @param id
 * @param status
 * @returns
 */
export const updateErrorAPI = async (id, status) => {
  return request.put('/apis/error/errors', {
    id,
    status
  })
}
