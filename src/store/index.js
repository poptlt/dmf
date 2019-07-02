
function setObjectValue(root, path, value) {
    if (path.length == 0) {
        root = value
    }
    else {
        for (let i = 0; i < path.length - 1; i++) {
            root = root[path[i]];
        }
        root[path[path.length - 1]] = value;
    }
}

function toDMFerror(error) {
    let err = {DMF_ERROR: true};

    if (error.code === 'ECONNABORTED') {
        err.message = 'Не удалось дождаться ответа от сервера!';
        err.code = 0;
    }
    else if (error.response.status == 500) {
        err.message = error.response.data.Message;
        err.code = 500;
    }
    else {
        err.message = 'Системная ошибка';
        err.code = 999;
    }

    return err;
}

function getObjectValue(root, path) {
    if (path.length == 0) {
        return root
    }
    else {
        for (let i = 0; i < path.length - 1; i++) {
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
      ObjectsTree: undefined
  },

    getters : {
        OBJECTS: state => {
            return state.Objects;},
        OBJECTS_TREE: state => {
            return state.ObjectsTree;},
    },

    mutations: {
        SET_AUTH : (state, value) => {
            state.AuthState = value;
        },
        ADD_OBJECTS: (state, {root, path, value}) => {
            setObjectValue(root, path, value);
        },
        ADD_TREE_LEVEL: (state, {root, data}) => {
            root.push(data);
        }
    },

    actions : {

        TEST: ({state, dispatch}) => {

            console.log(state);

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
            return Axios({method: "post", timeout: 15000, url: url, data: data, withCredentials: true})
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

        GET_OBJECTS: ({state, commit, dispatch}, {root, path, toServer, refresh = false, transform = (data) => {return data}}) => {

            // получаем текущее состояние загружаемого объекта
            let obj = getObjectValue(root, path);
            // загружаем объект с сервера, только если это явно запрошенное обновление
            // или если там нет реальных данных
            // и не трогаем объекты в состоянии загрузки (значит скоро туда придут данные с сервера)
            if (refresh || ((obj == undefined || (typeof obj == 'object' && obj.DMF_ERROR)) && obj != 'loading')) {
                // если данные все таки нужно загрузить текущим процессом, то
                // ставим туда состояние загрузки, чтобы другие процессы не пытались грузить параллельно
                commit('ADD_OBJECTS', {root: root, path: path, value: 'loading'});
                 // обработчик положительного ответа
                let resolve = (response) => {
                    // если с ответом все в порядке и данные в дереве объекта в состоянии загрузки,
                    if (response.status == 200 && getObjectValue(root, path) == 'loading') {
                        // то записываем их в дерево, предварительно трансформировав в нужную форму
                        commit('ADD_OBJECTS', {root: root, path: path, value: transform(response.data)});
                    }
                };

                // обработчик ошибки
                let reject = (error) => {
                   commit('ADD_OBJECTS', {root: root, path: path, value: toDMFerror(error)});
                };

                // отправляем запрос
                return dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
            }
        },

        AUTH: (context, payload) => {
            Axios({method: "post", timeout: 15000, url: "http://dev2.dmf.su/func/login", data: payload, withCredentials: true})
                .then(function (response) {
                    console.log("прошло");
                    console.log(response);
                    if (response.status == 200) {
                        context.commit('SET_AUTH', true)
                    }
                })
                .catch(function (error) {
                    console.log("авторизация ошибка");
                    console.log(error);
                });
        },

        GET_FIRMS: ({state, dispatch}) => {

            let root = state;
            let path1 = ['Objects'];
            let transform1 = (data) => {
                let res = {};
                for (let i = 0; i < data.length; i++) {
                    res[data[i].FirmID] = {name: data[i].Name};
                }
                return res;
            };
            dispatch('GET_OBJECTS', {toServer: ['GetFirms'], root: root, path: path1, transform: transform1});

            let path2 = ['ObjectsTree'];
            let transform2 = (data) => {
                let res = [];
                for (let i = 0; i < data.length; i++) {
                    res.push({id: data[i].FirmID, name: data[i].Name, FirmID: data[i].FirmID, children: []});
                }
                return res;
            };
            dispatch('GET_OBJECTS', {toServer: ['GetFirms'], root: root, path: path2, transform: transform2});
        },

        GET_TREE_LEVEL: ({state, dispatch, commit}, payload) => {

            let toServer = ['TreeNodes', payload.FirmID, payload.id, true];

            let resolve = ({data}) => {
                let root = payload.children;
                for (let i = 0; i < data.length; i++) {
                    let node = {id: data[i].NodeID, name: data[i].NodeName, FirmID: data[i].FirmID};
                    if (data[i].NodesQnt > 0) {node.children = []}
                    commit('ADD_TREE_LEVEL', {root: root, data: node});
                }
            }

            let reject = (error) => {
                console.log(toDMFerror(error))
            }

            return dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
        }
    }
})
