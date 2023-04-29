// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 获取个人处理文件列表 API
 * @param pageNumber
 * @param pageSize
 * @returns
 */
export const getMyFileListAPI = async (pageNumber, pageSize) => {
  return request.get('/apis/file', {
    params: {
      pageNumber,
      pageSize
    }
  })
}

/**
 * 获取个人处理文件列表 API
 * @returns
 */
export const getMyFinishFileListAPI = async () => {
  return request.get('/apis/file/finish')
}

/**
 * 删除个人处理文件 API
 * @param taskId
 * @returns
 */
export const deleteMyFileAPI = async taskId => {
  return request.delete('/apis/file', {
    params: {
      taskId
    }
  })
}
