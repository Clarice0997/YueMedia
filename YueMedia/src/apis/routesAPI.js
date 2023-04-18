// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 获取路由 API
 * @returns
 */
export const getRoutesAPI = async () => {
  return request.get(`/apis/routes?timestamp=${Date.now()}`)
}
