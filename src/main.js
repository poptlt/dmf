import Vue from 'vue'
import App from './App.vue'

import Vuetify from 'vuetify'
Vue.use(Vuetify)
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'


import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'


import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false


import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)

// test123kh,lk

import { store } from './store'

Vue.config.productionTip = false

// глобальная примесь для доступа к данным по пути
// если путь где-либо прерывается, то возвращается undefined
// иначе возвращаются собственно данные
Vue.mixin({
    methods: {
        dataState: (root, path) => {
             for(let i = 0; i < path.length; i++)
                {
                    if (root === undefined) {return undefined}
                    if (root === null) {return undefined}
                    if (typeof root != 'object') {return undefined}
                    if (root[path[i]] === undefined) {return undefined}
                    root = root[path[i]];
                } 
            return root;
        }
    }
})


new Vue({
    store,
  render: h => h(App),
}).$mount('#app')
