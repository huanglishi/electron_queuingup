import axios from 'axios'
import {
  VueAxios
} from './axios'
// 创建 axios 实例
const service = axios.create({
  baseURL: '', // api base_url
  timeout: 25000 // 请求超时时间
})

const err = (error) => {
  if (error.response) {
    const data = error.response.data
    if (error.response.status === 403) {
      const myNotification = new Notification('请求数据提示', {
        body: data.message
      })
      myNotification.onclick = () => {
        console.log('通知被点击')
      }
    }
    if (error.response.status === 401 && !(data.result && data.result.isLogin)) {
      const myNotification = new Notification('请求数据提示', {
        body: "Authorization verification failed"
      })
      myNotification.onclick = () => {
        console.log('通知被点击')
      }
    }
  }
  return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use(config => {
  const token = ""
  if (token) {
    config.headers['Access-Token'] = token // 让每个请求携带自定义 token 请根据实际情况自行修改
  }else{
    config.headers['X-Token'] ='yes'
  }
  return config
}, err)

// response interceptor
service.interceptors.response.use((response) => {
    if(response.data.code==11){
      return false
    }else{
      return response.data
    }
}, err)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, service)
  }
}

export {
  installer as VueAxios,
  service as axios
}
