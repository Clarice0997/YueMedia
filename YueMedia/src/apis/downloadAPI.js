// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 下载文件接口
 * @param downloadPath
 * @returns
 */
export const downloadAPI = async downloadPath => {
  return request.get('/apis/download', {
    responseType: 'blob',
    params: {
      downloadPath
    }
  })
}
