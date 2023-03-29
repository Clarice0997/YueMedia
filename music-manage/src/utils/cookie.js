// cookie处理工具类
/* global $cookies */

// 获取校验token
export function getCookie(key) {
  return $cookies.get(key)
}

// 保存校验token
export function setCookie(key, value) {
  $cookies.set(key, value, { expires: '7D' })
}

// 删除校验token
export function deleteCookie(key) {
  $cookies.remove(key)
}
