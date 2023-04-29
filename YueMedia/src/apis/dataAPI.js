// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 获取登录数据 API
 * @returns
 */
export const getLoginRecordAPI = async () => {
  return request.get('/apis/data/login/record')
}

/**
 * 获取用户概述数据 API
 * @returns
 */
export const getUserTotalDataAPI = async () => {
  return request.get('/apis/data/')
}
