// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 登录 API
 * @param {*} username
 * @param {*} password
 * @returns
 */
export const loginAPI = async (username, password) => {
  return request.post('/apis/user/account/login', { username, password })
}

/**
 * 注册 API
 * @param {*} param0
 * @returns
 */
export const registerAPI = async ({ username, password, nickname, phone, email }) => {
  return request.post('/apis/user/account/register', { username, password, nickname, phone, email })
}

/**
 * 验证验证码 API
 * @param {*} answer
 * @returns
 */
export const validateSafeCodeAPI = async answer => {
  return request.get('/apis/safecode/validate', {
    params: {
      answer
    }
  })
}

/**
 * 验证登录有效性 API
 * @returns
 */
export const verify = async () => {
  return request.get(`/apis/user/verify?timestamp=${Date.now()}`)
}

/**
 * 获取用户个人信息 API
 * @returns
 */
export const getProfile = async () => {
  return request.get('/apis/user/account/profile')
}
