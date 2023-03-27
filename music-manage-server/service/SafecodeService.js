// import module
const svgCaptcha = require('svg-captcha')
const { v4: uuidv4 } = require('uuid')
const { redisHandler } = require('../db/redis')

// Math 验证码生成相关参数
const MathCaptchaConfig = {
  fontSize: 38,
  noise: 3,
  width: 80,
  height: 32,
  color: true,
  mathOperator: '+/-',
  mathMin: 10,
  mathMax: 50
}

// String 验证码生成相关参数
const StringCaptchaConfig = {
  fontSize: 38,
  noise: 3,
  width: 80,
  height: 32,
  color: true
}

/**
 * Redis set SafeCode
 * @param {*} uuid
 * @param {*} text
 */
async function setSafeCode(uuid, text) {
  try {
    await redisHandler('set', uuid, text)
  } catch (err) {
    console.log(`Redis SafeCode Set Error => ${err}`)
    throw err
  }
}

/**
 * Redis get SafeCode
 * @param {*} uuid
 */
async function getSafeCode(uuid) {
  try {
    return redisHandler('get', uuid)
  } catch (err) {
    console.log(`Redis SafeCode Get Error => ${err}`)
    throw err
  }
}

/**
 * Redis del SafeCode
 * @param {*} uuid
 * @returns
 */
async function delSafeCode(uuid) {
  try {
    return redisHandler('del', uuid)
  } catch (err) {
    console.log(`Redis SafeCode Del Error => ${err}`)
    throw err
  }
}

/**
 * generate captcha
 * @param {*} type
 * @returns
 */
async function generateSafeCode(type) {
  // 生成 uuid
  const uuid = uuidv4()

  let captcha

  // 生成验证码
  switch (type) {
    case 'string':
      captcha = svgCaptcha.create(StringCaptchaConfig)
      break
    case 'math':
      captcha = svgCaptcha.createMathExpr(MathCaptchaConfig)
      break
    default:
      captcha = svgCaptcha.create(StringCaptchaConfig)
  }

  // Redis storage
  try {
    await setSafeCode(uuid, captcha.text)
  } catch (err) {
    throw {
      code: 500,
      data: {
        message: err
      }
    }
  }

  // 返回验证码数据
  return {
    code: 200,
    data: {
      svg: captcha.data,
      uuid
    }
  }
}

async function validateSafeCode(type, answer, uuid) {
  // 判断参数是否合法
  if (!(type && answer && uuid)) {
    throw {
      code: 400,
      data: {
        message: '请求参数不合法！'
      }
    }
  }

  // 根据 uuid 从 Redis 中取出答案
  let result
  try {
    result = await getSafeCode(uuid)
  } catch (err) {
    throw {
      code: 500,
      data: {
        message: err
      }
    }
  }

  // 判断验证码类型
  let flag
  if (type === 'string') {
    flag = answer.toLowerCase() === result.toLowerCase()
  } else if (type === 'math') {
    flag = Number(answer) === Number(result)
  }

  // 返回值
  if (flag) {
    // 清除 Redis 缓存
    try {
      await delSafeCode(uuid)
    } catch (err) {
      throw {
        code: 500,
        data: {
          message: err
        }
      }
    }
    return {
      code: 200,
      data: {
        message: '验证码验证成功'
      }
    }
  } else {
    return {
      code: 400,
      data: {
        message: '验证码验证失败'
      }
    }
  }
}

// 导出 Service
module.exports = { generateSafeCode, validateSafeCode }
