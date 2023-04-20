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
