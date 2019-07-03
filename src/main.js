import Vue from 'vue'
import App from './App.vue'

import Vuetify from 'vuetify'
Vue.use(Vuetify)
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)

// test123kh,lk

import { store } from './store'

Vue.config.productionTip = false

new Vue({
    store,
  render: h => h(App),
}).$mount('#app')
