// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 下载文件接口
 * @param downloadPath
 * @param downloadType
 * @returns
 */
export const downloadAPI = async (downloadPath, downloadType) => {
  return request.get('/apis/download', {
    responseType: 'blob',
    params: {
      downloadPath,
      downloadType
    }
  })
}
