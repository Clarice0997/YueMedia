// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 下载文件 API
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

/**
 * 下载处理任务压缩包 API
 * @param downloadPath
 * @param downloadType
 * @returns
 */
export const downloadPatchAPI = async (downloadPath, downloadType) => {
  return request.get('/apis/download/patch', {
    responseType: 'blob',
    params: {
      downloadPath,
      downloadType
    }
  })
}
