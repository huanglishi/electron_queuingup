import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
// mount axios Vue.$http and this.$http
import { VueAxios } from './utils/request'
Vue.use(VueAxios)

new Vue({
  render: h => h(App),
}).$mount('#app')
