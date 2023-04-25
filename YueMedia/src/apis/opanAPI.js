// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 获取开放 API Token API
 * @param endDate
 * @returns
 */
export const getOpenApiTokenAPI = async endDate => {
  return request.get('/apis/openapi', {
    params: {
      endDate
    }
  })
}
