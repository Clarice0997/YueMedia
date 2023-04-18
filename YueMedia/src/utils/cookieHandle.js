/**
 * 获取 Cookie 函数
 *
 * @param {*} cname
 * @returns
 */
export function getCookie(cname) {
  /**
   * document.cookie
   * 返回格式：
   *   键=值;键=值;...
   */
  // 拼接匹配字符串
  const cookieName = cname + '='
  // 分割字符串组成 Cookie 数组
  const cookieArray = document.cookie.split(';')
  // 循环 Cookie 数组，查找到匹配的 Cookie 字符串
  for (var i = 0; i < cookieArray.length; i++) {
    // 处理字符串
    let cookieStr = cookieArray[i].trim()
    // 判断 Cookie 是否匹配
    // 分割 Cookie 字符串，返回 Cookie 值
    if (cookieStr.indexOf(cookieName) === 0) return cookieStr.substring(cookieName.length, c.length)
  }
  // 如果没有找到则返回空字符串
  return ''
}
