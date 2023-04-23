// import module
const svgCaptcha = require('svg-captcha')
const { v4: uuidv4 } = require('uuid')
const { hsetRedis, hdelRedis, hgetRedis } = require('../utils/redis/RedisHandler')
const { ServiceErrorHandler } = require('../middlewares/ErrorCatcher')

// Math 验证码生成相关参数
const MathCaptchaConfig = {
  fontSize: 38,
  noise: 3,
  width: 80,
  height: 32,
  color: true,
  mathOperator: '+',
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
 * 验证码生成 Service
 * @param {*} type
 * @returns
 */
async function generateSafeCode(type) {
  try {
    // 生成 uuid
    const uuid = uuidv4()

    let captcha

    if (!type) {
      Boolean(Math.round(Math.random())) ? (type = 'string') : (type = 'math')
    }

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
    await hsetRedis('captcha_hash', uuid, captcha.text)
    // 返回验证码数据
    return {
      code: 200,
      data: {
        svg: captcha.data,
        uuid,
        type
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
 * 验证验证码 Service
 * @param {*} type
 * @param {*} answer
 * @param {*} uuid
 * @returns
 */
async function validateSafeCode(type, answer, uuid) {
  try {
    // 判断参数是否合法
    if (!(type && answer && uuid)) {
      return {
        code: 400,
        data: {
          message: '请求参数不合法！'
        }
      }
    }
    // 根据 uuid 从 Redis 中取出答案
    let result
    result = await hgetRedis('captcha_hash', uuid)
    // 判断验证码类型
    let flag
    if (type === 'string') {
      flag = answer.toLowerCase() === result.toLowerCase()
    } else if (type === 'math') {
      flag = Number(answer) === Number(result)
    }
    // 判断验证码是否正确
    if (flag) {
      // 删除 Redis 中的键值
      await hdelRedis('captcha_hash', uuid)
      // 返回成功对象
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

// 导出 Service
module.exports = { generateSafeCode, validateSafeCode }
