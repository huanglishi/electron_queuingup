import { axios } from '@/utils/request'
/**
 *  获取基础信息
 * @param {*} parameter 
 */
 export function getqueuingup (parameter) {
  return axios({
    url: parameter.base+'/meterfree.queuingupcall/getqueuingup',
    method: 'get',
    params: parameter
  })
}