// import module
const router = require('express').Router()
const { errorHandler } = require('../middlewares/ErrorCatcher')
const { adminAuth } = require('../middlewares/Auth')
const { selectUserListService, updateUserDataService } = require('../services/UserManagerService')

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

module.exports = router
