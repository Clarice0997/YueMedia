// import modules
const { hashSync, compareSync } = require('bcrypt')
const { mysqlHandler } = require('../db/mysql')
const { v4: uuidv4 } = require('uuid')
const { generateJsonWebToken } = require('../utils/Jwt')
const { LoginRecord } = require('../dbModel/loginRecordModel')

/**
 * Save loginRecord
 * @param {*} uno
 * @param {*} username
 * @param {*} loginIp
 */
async function loginRecord(uno, username, loginIp) {
  try {
    const loginRecord = new LoginRecord({
      uno,
      username,
      loginTime: new Date(),
      loginIp
    })
    await loginRecord.save()
  } catch (err) {
    console.error(err)
  }
}

/**
 * loginService
 * @param {*} username
 * @param {*} password
 * @param {*} ip
 * @returns
 */
async function loginService(username, password, ip) {
  // 判断参数是否存在
  if (!(username && password)) {
    return {
      code: 400,
      data: {
        message: '请求参数不完整！'
      }
    }
  }
  // 获取 MySQL 用户信息，判断用户是否存在
  // 防止暴力破解
  const user = await mysqlHandler(`select * from users where username = ?`, [username])
  if (user == false) {
    return {
      code: 400,
      data: {
        message: '账号密码错误！'
      }
    }
  }
  // 用户存在则比对密码是否相同
  let flag = compareSync(password, user[0].password)
  if (flag) {
    let token = await generateJsonWebToken({ uno: user[0].uno, username: user[0].username, nickname: user[0].nickname, status: user[0].status, type: user[0].type })
    await loginRecord(user[0].uno, user[0].username, ip)
    return {
      code: 200,
      data: {
        message: '登录成功！',
        token
      }
    }
  } else {
    return {
      code: 400,
      data: {
        message: '账号密码错误！'
      }
    }
  }
}

/**
 * registerService
 * @param {*} param0
 * @returns
 */
async function registerService({ username, password, nickname, phone, email }) {
  // 判断参数是否存在
  if (!(username && password && nickname && phone && email)) {
    return {
      code: 400,
      data: {
        message: '请求参数不完整！'
      }
    }
  }

  // 判断用户是否已被注册
  if ((await mysqlHandler(`select * from users where username = ?`, [username])) != false) {
    return {
      code: 409,
      data: {
        message: '用户已被注册！'
      }
    }
  }
  // 判断电话是否已被使用
  if ((await mysqlHandler(`select * from users where phone = ?`, [phone])) != false) {
    return {
      code: 409,
      data: {
        message: '电话已被使用！'
      }
    }
  }
  // 判断邮箱是否已被使用
  if ((await mysqlHandler(`select * from users where email = ?`, [email])) != false) {
    return {
      code: 409,
      data: {
        message: '邮箱已被使用！'
      }
    }
  }
  // 注册新用户，新增用户数据
  await mysqlHandler(`insert into users(uno,username,password,nickname,phone,email) values(?,?,?,?,?,?)`, [await uuidv4(), username, await hashSync(password, 10), nickname, phone, email])

  // 成功注册返回
  return {
    code: 200,
    data: { message: '注册成功！' }
  }
}

module.exports = { loginService, registerService }
