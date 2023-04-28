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
