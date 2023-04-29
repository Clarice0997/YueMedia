// import module
const router = require('express').Router()
const { errorHandler } = require('../middlewares/ErrorCatcher')
const { adminAuth } = require('../middlewares/Auth')
const { selectUserListService, updateUserDataService, updateUserPasswordService, updateUserStatusService, deleteUserService, deleteUserBatchService } = require('../services/UserManagerService')

/**
 * @api {GET} /apis/userManager/user 获取用户列表、用户数量接口
 * @apiName selectUserList
 * @apiGroup UserManager
 * @apiName UserManager/selectUserList
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {Number} [pageNumber] 页数
 * @apiParam {Number} [pageSize] 条数
 */
router.get('/user', adminAuth, async (req, res) => {
  try {
    // 获取分页数据
    const { pageNumber, pageSize, uno } = req.query
    // Service
    const { data, code } = await selectUserListService(pageNumber, pageSize, uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {PUT} /apis/userManager/userData 修改用户信息接口
 * @apiName updateUserData
 * @apiGroup UserManager
 * @apiName UserManager/updateUserData
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {String} [nickname] 昵称
 * @apiBody {String} [phone] 电话
 * @apiBody {String} [email] 邮箱
 * @apiBody {String} [storage] 存储空间
 * @apiBody {String} uno 用户ID
 */
router.put('/userData', adminAuth, async (req, res) => {
  try {
    // 获取修改数据
    const { nickname, phone, email, storage, uno } = req.body
    // Service
    const { data, code } = await updateUserDataService(nickname, phone, email, storage, uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {PUT} /apis/userManager/userData/password 修改用户密码接口
 * @apiName updateUserPassword
 * @apiGroup UserManager
 * @apiName UserManager/updateUserPassword
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {String} password 密码
 * @apiBody {String} uno 用户ID
 */
router.put('/userData/password', adminAuth, async (req, res) => {
  try {
    // 获取修改密码和用户 ID
    const { password, uno } = req.body
    // Service
    const { data, code } = await updateUserPasswordService(password, uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {PUT} /apis/userManager/userData/status 改变用户状态接口
 * @apiName updateUserStatus
 * @apiGroup UserManager
 * @apiName UserManager/updateUserStatus
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiBody {String} status 状态
 * @apiBody {String} uno 用户ID
 */
router.put('/userData/status', adminAuth, async (req, res) => {
  try {
    // 获取修改状态和用户 ID
    const { status, uno } = req.body
    // Service
    const { data, code } = await updateUserStatusService(status, uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {DELETE} /apis/userManager/user 删除用户接口
 * @apiName deleteUser
 * @apiGroup UserManager
 * @apiName UserManager/deleteUser
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} uno 用户ID
 */
router.delete('/user', adminAuth, async (req, res) => {
  try {
    // 获取要删除的用户 ID
    const { uno } = req.query
    // Service
    const { data, code } = await deleteUserService(uno)
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

/**
 * @api {DELETE} /apis/userManager/user/batch 批量删除用户接口
 * @apiName deleteUserBatch
 * @apiGroup UserManager
 * @apiName UserManager/deleteUserBatch
 * @apiPermission Admin
 * @apiHeader {String} Authorization JWT鉴权
 * @apiParam {String} unoList 用户ID数组JSON格式
 */
router.delete('/user/batch', adminAuth, async (req, res) => {
  try {
    // 获取要删除的用户JSON数组
    const { unoList } = req.query
    // Service
    const { data, code } = await deleteUserBatchService(JSON.parse(unoList))
    // response
    res.status(code).send({ ...data, code })
  } catch (error) {
    errorHandler(error, req, res)
  }
})

module.exports = router
