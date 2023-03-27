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

// 导出 Service
module.exports = { generateSafeCode }
