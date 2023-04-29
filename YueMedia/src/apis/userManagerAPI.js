// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 获取用户列表、用户数量 API
 * @param pageNumber
 * @param pageSize
 * @param uno
 * @returns
 */
export const selectUserListAPI = async (pageNumber, pageSize, uno) => {
  return request.get('/apis/userManager/user', {
    params: {
      pageNumber,
      pageSize,
      uno
    }
  })
}

/**
 * 修改用户信息 API
 * @param nickname
 * @param phone
 * @param email
 * @param storage
 * @param uno
 * @returns
 */
export const updateUserDataAPI = async ({ nickname, phone, email, storage }, uno) => {
  return request.put('/apis/userManager/userData', {
    nickname,
    phone,
    email,
    storage,
    uno
  })
}

/**
 * 修改用户密码 API
 * @param password
 * @param uno
 * @returns
 */
export const updateUserPasswordAPI = async (password, uno) => {
  return request.put('/apis/userManager/userData/password', {
    password,
    uno
  })
}

/**
 * 改变用户状态 API
 * @param status
 * @param uno
 * @returns
 */
export const updateUserStatusAPI = async (status, uno) => {
  return request.put('/apis/userManager/userData/status', {
    status,
    uno
  })
}

/**
 * 删除用户 API
 * @param uno
 * @returns
 */
export const deleteUserAPI = async uno => {
  return request.delete('/apis/userManager/user', {
    params: {
      uno
    }
  })
}

/**
 * 批量删除用户 API
 * @param unoList
 * @returns
 */
export const deleteUserBatchAPI = async unoList => {
  return request.delete('/apis/userManager/user/batch', {
    params: {
      unoList: JSON.stringify(unoList)
    }
  })
}
