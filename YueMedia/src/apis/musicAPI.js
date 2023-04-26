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

/**
 * 获取个人音乐列表、音乐数量 API
 * @param pageNumber
 * @param pageSize
 * @returns
 */
export const selectMusicListAPI = async (pageNumber, pageSize) => {
  return request.get('/apis/music', {
    params: {
      pageNumber,
      pageSize
    }
  })
}

/**
 * 批量下载音频文件 API
 * @param fileList
 * @returns
 */
export const downloadMusicBatchAPI = async fileList => {
  const fileListJson = JSON.stringify(fileList)
  return request.get('/apis/music/download/music/batch', {
    params: {
      fileList: fileListJson
    }
  })
}

/**
 * 批量删除音频文件 API
 * @param fileList
 * @returns
 */
export const deleteMusicBatchAPI = async fileList => {
  const fileListJson = JSON.stringify(fileList)
  return request.delete('/apis/music/delete/music/batch', {
    params: {
      fileList: fileListJson
    }
  })
}

/**
 * 开始播放音频 API
 * @param musicData
 * @returns
 */
export const startPlayMusicAPI = async musicData => {
  const musicDataJson = JSON.stringify(musicData)
  return request.get('/apis/music/play', {
    params: {
      musicData: musicDataJson
    }
  })
}

/**
 * 下载音频 API
 * @param musicData
 * @returns
 */
export const downloadMusicAPI = async musicData => {
  const musicDataJson = JSON.stringify(musicData)
  return request.get('/apis/music/download/music', {
    params: {
      musicData: musicDataJson
    }
  })
}

/**
 * 删除音频 API
 * @param musicData
 * @returns
 */
export const deleteMusicAPI = async musicData => {
  const musicDataJson = JSON.stringify(musicData)
  return request.delete('/apis/music/delete/music', {
    params: {
      musicData: musicDataJson
    }
  })
}

/**
 * 修改音频开放状态 API
 * @param musicData
 * @returns
 */
export const updateMusicStatusAPI = async musicData => {
  const musicDataJson = JSON.stringify(musicData)
  return request.put('/apis/music/status', {
    musicData: musicDataJson
  })
}
