// 导入封装 axios 对象
import request from '@/utils/request.js'

/**
 * 获取登录数据 API
 * @returns
 */
export const getLoginRecordAPI = async () => {
  return request.get('/apis/data/login/record')
}

/**
 * 获取用户概述数据 API
 * @returns
 */
export const getUserTotalDataAPI = async () => {
  return request.get('/apis/data/')
}

/**
 * 获取 OPEN API 调用情况折线图数据 API
 * @returns
 */
export const getOpenApiLineRecordAPI = async () => {
  return request.get('/apis/data/openApi/lineRecord')
}

/**
 * 获取下载类型饼图数据 API
 * @returns
 */
export const getDownloadPieRecordAPI = async () => {
  return request.get('/apis/data/download/pieRecord')
}

/**
 * 获取下载类型折线图数据 API
 * @returns
 */
export const getDownloadLineRecordAPI = async () => {
  return request.get('/apis/data/download/lineRecord')
}

/**
 * 获取 OPEN API 调用情况饼图数据 API
 * @returns
 */
export const getOpenApiPieRecordAPI = async () => {
  return request.get('/apis/data/openApi/pieRecord')
}

/**
 * 获取 SQL 折线图数据 API
 * @returns
 */
export const getSqlLineRecordAPI = async () => {
  return request.get('/apis/data/sql/lineRecord')
}
