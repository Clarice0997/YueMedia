// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 上传音乐数据 API
 * @param data
 * @returns
 */
export const UploadMusicDataAPI = async data => {
  return request.post('/apis/music/upload/music/data', data)
}
