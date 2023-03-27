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

// Redis set SafeCode
function setSafeCode(uuid, text) {
  return new Promise((resolve, reject) => {
    redisHandler('set', uuid, text)
      .then(() => {
        resolve()
      })
      .catch(err => {
        console.log(`Redis SafeCode Set Error => ${err}`)
        reject()
      })
  })
}

function generateSafeCode(type, callback) {
  // 生成 uuid
  const uuid = uuidv4()

  // 条件判断
  const actions = {
    string: () => {
      const captcha = svgCaptcha.create(StringCaptchaConfig)
      // Set Redis
      setSafeCode(uuid, captcha.text)
        .then(() => {
          callback({
            code: 200,
            data: {
              svg: captcha.data,
              uuid
            }
          })
        })
        .catch(err => {
          callback({
            code: 500,
            data: {
              message: err
            }
          })
        })
    },
    math: () => {
      const captcha = svgCaptcha.createMathExpr(MathCaptchaConfig)
      // Set Redis
      setSafeCode(uuid, captcha.text)
        .then(() => {
          callback({
            code: 200,
            data: {
              svg: captcha.data,
              uuid
            }
          })
        })
        .catch(err => {
          callback({
            code: 500,
            data: {
              message: err
            }
          })
        })
    }
  }

  return actions[type]?.() ?? actions['string']()
}

// 导出 Service
module.exports = { generateSafeCode }
