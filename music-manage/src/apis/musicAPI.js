// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 删除临时音乐文件 API
 * @param musicName
 * @param coverName
 * @returns
 */
export const deleteTempMusicAPI = async (musicName, coverName) => {
  return request.delete('/apis/music/upload/music/temp', {
    params: {
      musicName,
      coverName
    }
  })
}

/**
 * 上传音乐数据 API
 * @param data
 * @returns
 */
export const uploadMusicDataAPI = async data => {
  return request.post('/apis/music/upload/music/data', data)
}
