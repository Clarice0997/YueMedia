// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 修改用户信息 API
 * @param userData
 * @returns
 */
export const updateUserDataAPI = async userData => {
  return request.put(`/apis/user/account/profile`, {
    userData
  })
}

/**
 * 修改用户密码 API
 * @param password
 * @param newPassword
 * @returns
 */
export const updateUserPasswordAPI = async (password, newPassword) => {
  return request.put('/apis/user/account/password', {
    password,
    newPassword
  })
}
