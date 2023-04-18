// import modules
const { mysqlHandler } = require('../config/mysql')
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')

/**
 * 获取路由对象 Service
 * @param {*} param0
 * @returns
 */
const getRoutesService = async ({ type }) => {
  // 根据用户角色 查询对应的路由对象 返回路由对象
  try {
    const routes = await mysqlHandler('select r.* from routes r left join role_routes rr on r.id = rr.route_id where role_id = ?', [type])
    return {
      code: 200,
      data: {
        routes
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

module.exports = { getRoutesService }
