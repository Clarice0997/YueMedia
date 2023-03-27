// import modules
const { hashSync, compareSync } = require('bcrypt')
const { mysqlHandler } = require('../db/mysql')
const { v4: uuidv4 } = require('uuid')

// bcrypt.compareSync(password, dbPassword)

async function loginService(username, password) {
  // 判断参数是否存在
  if (!(username && password)) {
    throw {
      code: 400,
      data: {
        message: '请求参数不完整！'
      }
    }
  }
  // 获取 MySQL 用户信息，判断用户是否存在
  if (await mysqlHandler(`select * from users where username = ${username}`)) {
  }
}

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
  if ((await mysqlHandler(`select * from users where username = '${username}'`)) != false) {
    return {
      code: 409,
      data: {
        message: '用户已被注册！'
      }
    }
  }
  // 判断电话是否已被使用
  if ((await mysqlHandler(`select * from users where phone = '${phone}'`)) != false) {
    return {
      code: 409,
      data: {
        message: '电话已被使用！'
      }
    }
  }
  // 判断邮箱是否已被使用
  if ((await mysqlHandler(`select * from users where email = '${email}'`)) != false) {
    return {
      code: 409,
      data: {
        message: '邮箱已被使用！'
      }
    }
  }
  // 注册新用户，新增用户数据
  await mysqlHandler(`insert into users(uno,username,password,nickname,phone,email) values('${uuidv4()}','${username}','${hashSync(password, 10)}','${nickname}','${phone}','${email}')`)

  // 成功注册返回
  return {
    code: 200,
    data: { message: '注册成功！' }
  }
}

module.exports = { loginService, registerService }
