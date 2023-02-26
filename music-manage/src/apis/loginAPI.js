// 导入封装axios对象
import request from '@/utils/request.js'

/**
 * 注册
 *
 * @param {*} param0
 * @returns
 */
export const registerAPI = function ({ email, password }) {
  return request.post('', { email, password })
}

/**
 * 登录
 *
 * @param {*} param0
 * @returns
 */
export const loginAPI = function ({ email, password }) {
  return request.post('', { email, password })
}
