import axios from 'axios'
import { deleteCookie, getCookie } from '@/utils/cookie'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import router from '@/router'

// 配置Nprogress项 关闭右上角螺旋加载提示
NProgress.configure({ showSpinner: false })

// 默认设置校验码
axios.defaults.headers.common.Authorization = `Bearer ${getCookie('Access-Token')}`
// 设置默认请求格式
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// 允许axios携带cookie
axios.defaults.withCredentials = true

// 封装axios
const request = axios.create({
  baseURL: process.env.VUE_APP_REQUEST_URL,
  // 设置超时时间
  timeout: 5000
})

// 请求拦截器（携带Authorization，开启加载条）
request.interceptors.request.use(
  async config => {
    // 开启进度条
    NProgress.start()
    // 请求拦截添加校验码
    config.headers.Authorization = `Bearer ${getCookie('Access-Token')}`
    return config
  },
  error => {
    // 关闭进度条
    NProgress.done()
    return Promise.reject(error)
  }
)

// 响应拦截器（判断响应状态，如果未通过校验则跳转登陆页）
request.interceptors.response.use(
  response => {
    // 响应正常，直接返回响应数据
    return Promise.resolve(response)
  },
  async error => {
    if (error.response.status === 401) {
      await deleteCookie('Access-Token')
      await localStorage.removeItem('Access-Token')
      router.replace('/')
    }
    return Promise.reject(error)
  }
)

// 响应拦截器（关闭进度条）
request.interceptors.response.use(
  response => {
    // 关闭进度条
    NProgress.done()
    return response
  },
  error => {
    // 关闭进度条
    NProgress.done()
    return Promise.reject(error)
  }
)

// 导出封装axios对象
export default request
