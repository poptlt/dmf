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

//import { mapActions, mapState, mapMutations } from 'vuex';

let monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

import { getData, getPath } from './store/functions.js'

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
        },
        
        dateForServer: (date, type) => {
            
            let year = date.getFullYear(), month = date.getMonth()+1, day = date.getDate();
            
            if(type == "month")
            {
                return year + "-" + (month<10 ? "0" : "") + month + "-01T00:00:00";
            }
            
            if(type == "day")
            {
                return year + "-" + (month<10 ? "0" : "") + month + "-" + (day<10 ? "0" : "") + day + "T00:00:00";
            }
        },
        
        dateForClient: (date, type) => {
            
            if(typeof(date) == "string")
            {
                date = new Date(Date.parse(date));
            }
            
            let year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
            
            if(type == "month")
            {
                return monthNames[month] + " " + year;
            }
            
            if(type == "day")
            {
                return (day<10 ? "0" : "") + day + "." + (month+1<10 ? "0" : "") + (month + 1) + "." + year;
            }
        },

        //vuexGet: (...path) => getData(path),

        vuexGet: (...path) => getData(path, store.state),

        vuexClear: (queries) => {

            for(let key in queries)
            {
                store.commit('INSERT', {path: getPath(queries[key]), data: undefined});
            }
        },

        vuexLoad: (queries) => {

            let toServer = [];

            for(let key in queries)
            {
                if(getData( getPath(queries[key]), store.state ) === undefined)
                {
                    toServer.push(queries[key]);
                }
            }

            if(toServer.length) store.dispatch('LOAD_DATA', toServer);

            let res = {};

            for(let key in queries)
            {
                res[key] = getData( getPath(queries[key]), store.state );
            }

            return res;
        },

        isData: (data) => {

            function check(data)
            {
                if(data === undefined || data === null ||
                   (typeof(data) == 'object' && data.DMF_ERROR)) return false;
                else return true;
            }

            if(Array.isArray(data))
            {
                for(let i=0; i<data.length; i++)
                {
                    if(!check(data[i])) return false;
                }
            }
            else
            {
                for(let key in data)
                {
                    if(!check(data[key])) return false;
                }
            }
            return true;
        },

        showFor: (Roles, ...canSee) => {

            for(let i=0; i<Roles.length; i++)
            {
                for(let j=0; j<canSee.length; j++)
                {
                    if(Roles[i] == canSee[j]) return true;
                }
            }
            return false;
        }
    },
    /*computed: {

        store: () => store.state
    }*/
})


new Vue({
    store,
  render: h => h(App),
}).$mount('#app')
