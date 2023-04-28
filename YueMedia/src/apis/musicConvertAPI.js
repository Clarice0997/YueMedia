// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 删除待转码音乐文件 API
 * @param filename
 * @returns
 */
export const deleteConvertMusicAPI = async filename => {
  return request.delete('apis/convert/upload', {
    params: { filename }
  })
}

/**
 * 上传我的音频 API
 * @param filesData
 * @returns
 */
export const uploadMyFileConvertMusicAPI = async filesData => {
  return request.post('apis/convert/upload/myFile', { filesData })
}

/**
 * 获取支持音乐格式 API
 * @returns
 */
export const getSupportMusicCodecAPI = async () => {
  return request.get('apis/convert/support')
}

/**
 * 提交音频转码任务 API
 * @returns
 */
export const submitMusicConvertTaskAPI = async tasks => {
  return request.post('/apis/convert/submit', { tasks })
}

/**
 * 获取音频转码统计数据 API
 * @returns
 */
export const getMusicConvertAnalyseAPI = async () => {
  return request.get('apis/convert/data/analyse')
}
