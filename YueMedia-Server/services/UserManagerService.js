// import modules
const { mysqlHandler } = require('../config/mysql')
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')
const { hgetallRedis } = require('../utils/redis/RedisHandler')
const { hashSync } = require('bcrypt')
const { deleteUserPromise } = require('../utils/deleteUserPromise')

/**
 * 获取用户列表、用户数量 Service
 * @param pageNumber
 * @param pageSize
 * @param uno
 * @returns
 */
const selectUserListService = async (pageNumber, pageSize, uno) => {
  try {
    // 判断是否存在页码
    if (typeof pageNumber == 'undefined') {
      pageNumber = 1
    }
    // 判断是否存在页面条数限制
    if (typeof pageSize == 'undefined') {
      pageSize = 10
    }
    if (pageNumber <= 0 || pageSize <= 0 || !/\d+/gi.test(pageNumber) || !/\d+/gi.test(pageSize)) {
      return {
        code: 400,
        data: {
          message: '参数不合法'
        }
      }
    }

    // 查询数据条数
    let count
    if (uno) {
      ;[{ count }] = await mysqlHandler(`select count(*) count from users where type = 1 and del_flag = 1 and uno like "%${uno}%"`)
    } else {
      ;[{ count }] = await mysqlHandler('select count(*) count from users where type = 1 and del_flag = 1')
    }

    // 判断是否存在上传用户数据
    if (count === 0) {
      return {
        code: 200,
        data: {
          message: '不存在用户数据',
          count: 0
        }
      }
    }

    // 判断查询数据是否超出范围
    if (pageNumber * pageSize - pageSize >= count) {
      return {
        code: 200,
        data: {
          message: '数据超出范围',
          count
        }
      }
    }

    // 查询用户数据
    let userData
    if (uno) {
      userData = await mysqlHandler(`select id,uno,username,nickname,avatar,storage_size,phone,email,status,create_time,update_time from users where type = 1 and del_flag = 1 and uno like "%${uno}%" limit ?,?`, [(pageNumber - 1) * pageSize, Number(pageSize)])
    } else {
      userData = await mysqlHandler('select id,uno,username,nickname,avatar,storage_size,phone,email,status,create_time,update_time from users where type = 1 and del_flag = 1 limit ?,?', [(pageNumber - 1) * pageSize, Number(pageSize)])
    }

    const userStorages = await hgetallRedis('user_used_storage')
    const filterUserData = userData.map(user => {
      const filterUser = user
      if (userStorages[user.uno]) {
        filterUser['usage'] = Math.ceil((userStorages[user.uno] / filterUser.storage_size) * 100)
      } else {
        filterUser['usage'] = 0
      }
      return filterUser
    })

    // Return
    return {
      code: 200,
      data: { userData: filterUserData, count }
    }
  } catch (error) {
    ServiceErrorHandler(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

/**
 * 修改用户信息 Service
 * @param nickname
 * @param phone
 * @param email
 * @param storage
 * @param uno
 * @returns
 */
const updateUserDataService = async (nickname, phone, email, storage, uno) => {
  try {
    // 判断电话是否已被注册
    if (phone) {
      if ((await mysqlHandler('select * from users where phone = ?', [phone])).length !== 0) {
        return {
          code: 400,
          data: {
            message: '电话已被使用'
          }
        }
      }
    }
    // 判断邮箱是否已被注册
    if (email) {
      if ((await mysqlHandler('select * from users where email = ?', [email])).length !== 0) {
        return {
          code: 400,
          data: {
            message: '邮箱已被使用'
          }
        }
      }
    }
    // 获取用户数据
    const [userData] = await mysqlHandler('select * from users where uno = ?', [uno])
    // 修改用户数据
    await mysqlHandler('update users set nickname = ?,phone = ?,email = ?,storage_size = ? where uno = ?', [nickname ? nickname : userData.nickname, phone ? phone : userData.phone, email ? email : userData.email, storage ? storage : userData.storage_size, uno])

    return {
      code: 200,
      data: {
        message: '修改用户数据成功'
      }
    }
  } catch (error) {
    ServiceErrorHandler(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

/**
 * 修改用户密码 Service
 * @param password
 * @param uno
 * @returns
 */
const updateUserPasswordService = async (password, uno) => {
  try {
    // 判断参数是否存在
    if (!(password && uno)) {
      return {
        code: 400,
        data: {
          message: '参数不合法！'
        }
      }
    }
    // 修改用户密码
    await mysqlHandler('update users set password = ? where uno = ?', [await hashSync(password, 10), uno])

    return {
      code: 200,
      data: {
        message: '修改密码成功'
      }
    }
  } catch (error) {
    ServiceErrorHandler(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

/**
 * 改变用户状态 Service
 * @param status
 * @param uno
 * @returns
 */
const updateUserStatusService = async (status, uno) => {
  try {
    // 判断参数是否存在
    if (!(status && uno)) {
      return {
        code: 400,
        data: {
          message: '参数不合法！'
        }
      }
    }

    // 修改用户用户
    await mysqlHandler('update users set status = ? where uno = ?', [status, uno])

    return {
      code: 200,
      data: {
        message: '用户状态修改成功'
      }
    }
  } catch (error) {
    ServiceErrorHandler(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

/**
 * 删除用户 Service
 * @param uno
 * @returns
 */
const deleteUserService = async uno => {
  try {
    // 判断参数是否存在
    if (!uno) {
      return {
        code: 400,
        data: {
          message: '参数不合法！'
        }
      }
    }

    // 删除用户
    await deleteUserPromise(uno)

    return {
      code: 200,
      data: {
        message: '用户删除成功'
      }
    }
  } catch (error) {
    ServiceErrorHandler(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

/**
 * 批量删除用户 Service
 * @param unoList
 * @returns
 */
const deleteUserBatchService = async unoList => {
  try {
    // 判断参数是否存在
    if (!unoList) {
      return {
        code: 400,
        data: {
          message: '参数不合法！'
        }
      }
    }

    const userPromiseArr = []
    unoList.forEach(uno => {
      userPromiseArr.push(deleteUserPromise(uno))
    })

    await Promise.all(userPromiseArr)

    return {
      code: 200,
      data: {
        message: '批量删除用户成功'
      }
    }
  } catch (error) {
    ServiceErrorHandler(error)
    return {
      code: 500,
      data: {
        message: error.message
      }
    }
  }
}

module.exports = {
  selectUserListService,
  updateUserDataService,
  updateUserPasswordService,
  updateUserStatusService,
  deleteUserService,
  deleteUserBatchService
}
