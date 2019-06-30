
function setObjectValue(root, path, value)
    {
        if (path.length == 0)
            { root = value }
        else
            {
                for (let i = 0; i < path.length - 1; i++)
                    {
                        root = root[path[i]];
                    }
                root[path[path.length - 1]] = value;
            }
    }

function getObjectValue(root, path)
    {
        if (path.length == 0)
            { return root }
        else
            {
                for (let i = 0; i < path.length - 1; i++)
                    {
                        root = root[path[i]];
                    }
                return root[path[path.length - 1]];
            }
    }





import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
import Axios from 'axios'

export const store = new Vuex.Store({
  state: {
      AuthState: true,
      Objects: undefined,
      ObjectsTree: []
  },

  getters : {
      OBJECTS: state => {
      return state.Objects;},
      OBJECTS_TREE: state => {
      return state.ObjectsTree;},

      OBJECTS_TREE2: state => {

        let res = [];
        if (typeof state.Objects == 'object')
            {
                for (let obj in state.Objects)
                    {
                        res.push({id: obj, name: state.Objects[obj].Name, FirmID: state.Objects[obj].FirmID, children: []});


                    }
            }

        return res;
      },
  },

  mutations: {
      SET_AUTH : (state,payload) => {
        state.AuthState = payload
      },
      ADD_OBJECTS: (state, payload) => {
        setObjectValue(payload.root, payload.path, payload.value);
      },
      OBJECTS_LOADING: (state, payload) => {
        setObjectValue(payload.root, payload.path, 'loading');
      },
      ADD_TREE_LEVEL: (state, payload) => {
        payload.root.push(payload.data);
      }
  },

    actions : {

        TEST: ({dispatch}) => {
            let res = (result) => {console.log(result)}
            let err = (error) => {console.log(error)}

            dispatch('SERVER_REQUEST', {toServer: ['GetFirms'], resolve:res, reject: err});
        },

        SERVER_REQUEST: ({state, commit, dispatch}, {toServer, resolve, reject}) => {

            // создаем промис для ожидания восстановления пользовательской сессии
            let waitAuth = new Promise((resolve) => {
                let timer = setInterval(() => {
                    if (state.AuthState) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 500);
            });

            let url = "http://dev2.dmf.su/func";
            let data = {'exec':JSON.stringify(toServer)};

            // делаем запрос на сервер
            return Axios({method: "post", timeout: 10000, url: url, data: data, withCredentials: true})
                // при удачном исходе отдаем результат
                .then(response => {resolve(response)})
                // при ошибке
                .catch(error => {
                    // проверяем, не отсутствие ли авторизации
                    if (error.response && error.response.status == 403) {
                        // если авторизации нет, то сбрасываем переменную, чтобы появилась форма авторизации
                        commit('SET_AUTH', false);
                        // и ждем появления авторизации
                        waitAuth
                            .then(() => {
                                // после чего опять отправляем тот же запрос
                                dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
                            })
                    }
                    // если ошибка не связана с авторизацией, то отправляем ее на обработку
                    else {reject(error)}
                });
        },

 DATA_REQUEST: function (context, payload)
    {


        context.commit('OBJECTS_LOADING', {root: payload.root, path: payload.path});

        let url = "http://dev2.dmf.su/func";
        let data = {'exec':JSON.stringify(payload.toServer)};
        return Axios({method: "post", timeout: 10000, url: url, data: data, withCredentials: true})
            .then(function (response) {payload.func(response)})
            .catch(error => {

                         if (error.code === 'ECONNABORTED')
               { console.log('timeout');

                let err_obj = {ERROR_DMF: true, ERROR_CODE: 0, message: 'Не удалось дождаться ответа сервера!'};
                           context.commit('ADD_OBJECTS', {root: payload.root, path: payload.path, value: err_obj});

               }

                if (error.response)
                    {


                        if (error.response.status == 403)
                            {
                                context.commit('SET_AUTH', false);
                                let promise = new Promise((resolve, reject) =>
                                    {
                                        var timer = setInterval(function()
                                            {
                                                if (context.state.AuthState)
                                                    {
                                                        clearInterval(timer);
                                                        resolve("result");
                                                    }
                                            }, 1000);
                                    });

                                promise
                                  .then(result =>
                                        {
                                            context.dispatch('DATA_REQUEST', {toServer: payload.toServer, func: payload.func, root: payload.root, path: payload.path});
                                        },
                                        error =>
                                            {
                                                console.log("error: " + error); // error - аргумент reject
                                            });
                            }
                        else
                            {
                                // здесь все ошибки, кроме 403


                            }
                    }
                });
    },

      AUTH: (context, payload) => {
           Axios({method: "post", timeout: 15000, url: "http://dev2.dmf.su/func/login", data: payload, withCredentials: true})
              .then(function (response) {
              console.log("прошло");
              console.log(response);
              if (response.status == 200) {context.commit('SET_AUTH', true)}
          })
          .catch(function (error) {
      console.log("авторизация ошибка");
      console.log(error);
          });


      },

      GET_FIRMS: function(context, payload)
        {

            let func = function (response)
                {
                    let objs = {};
                    let root = context.state.ObjectsTree;
                    for (let i = 0; i < response.data.length; i++)
                        {
                            let data = {id: response.data[i].FirmID, name: response.data[i].Name, firm_id: response.data[i].FirmID};
                            data.children = [];
                            context.commit('ADD_TREE_LEVEL', {root: root, data: data});
                            objs[response.data[i].FirmID] = {Name: response.data[i].Name, FirmID: response.data[i].FirmID};
                        }

                    context.commit('ADD_OBJECTS', {root: context.state, path: ['Objects'], value: objs});
                };

            context.dispatch('DATA_REQUEST', {toServer: ['GetFirms'], func: func, root: context.state, path: ['Objects']});
        },

      GET_TREE_LEVEL: function(context, payload)
        {
          let toServer = ['TreeNodes', payload.FirmID, payload.id, true];
          let url = "http://dev2.dmf.su/func";
            let data = {'exec':JSON.stringify(toServer)};

            return Axios({method: "post", timeout: 15000, url: url, data: data, withCredentials: true})
                .then(function (response)
                      {
                let root = payload.children;
                 for (let i = 0; i < response.data.length; i++)
                {
                    let data = {id: response.data[i].NodeID, name: response.data[i].NodeName, firm_id: response.data[i].FirmID};
                    if (response.data[i].NodesQnt > 0)
                        {data.children = []}
                    context.commit('ADD_TREE_LEVEL', {root: root, data: data});
                }

                console.log(response);

                    })
                .catch(function (error)
                       {


                console.log(error);
                    });


        }
  }
})
