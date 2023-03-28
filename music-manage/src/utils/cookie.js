// cookie处理工具类
/* global $cookies */

// 获取校验token
export async function getCookie(key) {
  return $cookies.get(key)
}

// 保存校验token
export async function setCookie(key, value) {
  $cookies.set(key, value, { expires: '7D' })
}

// 删除校验token
export async function deleteCookie(key) {
  $cookies.remove(key)
}
