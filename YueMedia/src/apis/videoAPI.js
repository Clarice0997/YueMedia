// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 上传视频数据 API
 * @param videoData
 * @returns
 */
export const uploadVideoDataAPI = async videoData => {
  return request.post('/apis/video/upload/video/data', { videoData })
}

/**
 * 删除临时视频文件 API
 * @param videoFileName
 * @param videoCoverFileName
 * @returns
 */
export const deleteTempVideoAPI = async (videoFileName, videoCoverFileName) => {
  return request.delete('/apis/video/upload/video/temp', {
    params: {
      videoFileName,
      videoCoverFileName
    }
  })
}
