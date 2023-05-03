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

/**
 * 获取个人视频列表、视频数量 API
 * @param pageNumber
 * @param pageSize
 * @returns
 */
export const selectVideoListAPI = async (pageNumber, pageSize) => {
  return request.get('/apis/video', {
    params: {
      pageNumber,
      pageSize
    }
  })
}

/**
 * 下载视频 API
 * @param videoData
 * @returns
 */
export const downloadVideoAPI = async videoData => {
  const videoDataJson = JSON.stringify(videoData)
  return request.get('/apis/video/download/video', {
    params: {
      videoData: videoDataJson
    }
  })
}

/**
 * 开始播放视频 API
 * @param videoData
 * @returns
 */
export const startPlayVideoAPI = async videoData => {
  const videoDataJson = JSON.stringify(videoData)
  return request.get('/apis/video/play', {
    params: {
      videoData: videoDataJson
    }
  })
}

/**
 * 修改视频开放状态 API
 * @param videoData
 * @returns
 */
export const updateVideoStatusAPI = async videoData => {
  const videoDataJson = JSON.stringify(videoData)
  return request.put('/apis/video/status', {
    videoData: videoDataJson
  })
}

/**
 * 删除视频 API
 * @param videoData
 * @returns
 */
export const deleteVideoAPI = async videoData => {
  const videoDataJson = JSON.stringify(videoData)
  return request.delete('/apis/video/delete/video', {
    params: {
      videoData: videoDataJson
    }
  })
}

/**
 * 批量下载视频文件 API
 * @param fileList
 * @returns
 */
export const downloadVideoBatchAPI = async fileList => {
  const fileListJson = JSON.stringify(fileList)
  return request.get('/apis/video/download/video/batch', {
    params: {
      fileList: fileListJson
    }
  })
}

/**
 * 批量删除视频文件 API
 * @param fileList
 * @returns
 */
export const deleteVideoBatchAPI = async fileList => {
  const fileListJson = JSON.stringify(fileList)
  return request.delete('/apis/video/delete/video/batch', {
    params: {
      fileList: fileListJson
    }
  })
}

/**
 * 获取支持视频格式 API
 * @returns
 */
export const getSupportVideoCodecAPI = async () => {
  return request.get('/apis/video/support')
}
