import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
import Axios from 'axios'

function toDMFerror(error) {
    let err = {DMF_ERROR: true};

    if (error.code === 'ECONNABORTED') {
        err.message = 'Не удалось дождаться ответа от сервера!';
        err.code = 0;
    }
    else if (error.response =! undefined && error.response.status != undefined && error.response.status == 500) {
        err.message = error.response.data.Message;
        err.code = 500;
    }
    else {
        err.message = 'Системная ошибка';
        err.code = 999;
    }

    return err;
}

function isDMFerror(obj) {
    if (obj != null && typeof obj == 'object' && obj.DMF_ERROR) {return true}
    else {return false}
}

function checkRequest(root, object, request) {

    // на всякий случай проверяем, что переданный путь является объектом
    if (object === null || typeof object != 'object') {
        throw 'Системная ошибка! Переданный путь не является объектом!';
    }

    // и в нем должен быть хотя бы один ключ
    if (Object.keys(object).length == 0) {
        throw 'Системная ошибка! В переданном пути нет ни одного ключа!';
    }

    // корень данных не может быть не объектом
    if (root === null || typeof root != 'object') {
        return true;
    }
    else {
        for (let key in object) {
            // если ключа в существующих данных нет,
            if (root[key] == undefined) {
                // то запрос уже необходимо выполнить
                return true;
            }

            if (object[key] != null && typeof object[key] == 'object') {
                request = checkRequest(root[key], object[key], request);
            }
        }
    }

    return request;
}

function setObjectsValue(root, object, value) {
    
    // на всякий случай проверяем, что переданный путь является объектом
    if (object === null || typeof object != 'object') {
        throw 'Системная ошибка! Переданный путь не является объектом!';
    }

    // и в нем должен быть хотя бы один ключ
    if (Object.keys(object).length == 0) {
        throw 'Системная ошибка! В переданном пути нет ни одного ключа!';
    }

    // корень данных не может быть не объектом
    if (root === null || typeof root != 'object') {
        root = {}
    }

    for (let key in object) {
        // если ключа в существующих данных нет,
        if (root[key] == undefined) {
            // то добавляем этот ключ и для начала предполагаем, что дерево продолжается дальше
            Vue.set(root, key, {});
        }

        // если на следующем уровне вставляемых данных объект (массив не считаем за объект), то продолжаем растить дерево
        if (object[key] != null && typeof object[key] == 'object' && Object.keys(object[key]).length > 0 && !Array.isArray(object[key])) {
            setObjectsValue(root[key], object[key], value);
        }
        // иначе вставляем в данные значение
        else {
            if (value != undefined) {
                root[key] = value;
            }
            else {
                root[key] = object[key]
            }
        }
    }
}

export const store = new Vuex.Store({
  state: {
      AuthState: true,
      Objects: null
  },

    getters : {
    },

    mutations: {
        SET_AUTH : (state, value) => {
            state.AuthState = value;
        },
        SET_OBJECTS_VALUE: (state, {root, path, value}) => {
            setObjectsValue(root, path, value)
        },
    },

    actions : {

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

        INIT: ({state, dispatch}) => {
            
            let transform = (data) => {
                return {Objects: data}
            }

            dispatch('LOAD_OBJECTS', {root: state, object: {Objects: null}, toServer: ['Init'], refresh: true, transform: transform});
        },

        LOAD_OBJECTS: ({state, commit, dispatch}, {root, object, toServer, refresh = false, transform = (data) => {return data}}) => {


            // если у нас идет обновление данных, то запрос однозначно нужно исполнить
            let request = refresh;
            // если необходимость запроса пока отсутствует, то уточняем его по данным
            if (!request) {request = checkRequest(root, object, request)}

            // если выяснилось, что запрос необходимо выполнить
            if (request) {

                // добавляем в существующие данные все не существующие необходимые ключи и проставляем значение null
                setObjectsValue(root, object, null);

                // в случае положительного ответа от сервера
                let resolve = (response) => {
                                        
                    let data = transform(response.data);
                    setObjectsValue(root, data, undefined);

                }

                let reject = (error) => { console.log(error);
                     setObjectsValue(root, object, toDMFerror(error));
                }

                // отправляем подготовленный запрос
                dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
            }
        },

        LOAD_TREE_LEVEL: ({state, dispatch}, {FirmID, ObjectID = FirmID, hiddenEmpty = true}) => {

            let root = state.Objects[FirmID];
            let object = (ObjectID == FirmID) ? {Children: null, Objects: null} : {Objects: {[ObjectID]: {Children: null}}};
            let toServer = ['TreeNodes', FirmID, ObjectID, hiddenEmpty];

            let transform = (data) => {
                let list = [];
                let objs = {};
                for (let i = 0; i < data.length; i++) {
                    let node = {ObjectID: data[i].NodeID, FirmID: data[i].FirmID, Name: data[i].NodeName, ChildrenQnt: data[i].NodesQnt, LSQnt: data[i].LSQnt, Children: null};
                    list.push(node);
                    objs[data[i].NodeID] = {Name: data[i].NodeName, ChildrenQnt: data[i].NodesQnt, LSQnt: data[i].LSQnt};
                }
                if (ObjectID == FirmID) {
                    return {Objects: objs, Children: list};
                }
                else {
                    objs[ObjectID] = {Children: list};
                    let res = {Objects: objs};
                    return res;
                }
            }

            dispatch('LOAD_OBJECTS', {root: root,  object: object, toServer: toServer, transform: transform});
        },

        LOAD_LS_LIST: ({state, dispatch}, {FirmID, ObjectID = FirmID}) => {

            let root = state.Objects[FirmID];
            let object = (ObjectID == FirmID) ? {LS: null} : {Objects: {[ObjectID]: {LS: null}}};
            let toServer = ['LSList', ObjectID, FirmID];
            let transform = (data) => {
                let list = [];
                let objs = {};
                for (let i = 0; i < data.length; i++) {
                    let item = {ObjectID: data[i].LSID};
                    list.push(item);
                    objs[data[i].LSID] = {Number: data[i].Number, Balance:data[i].Balance};
                 }
                if (ObjectID == FirmID) {
                    return {Objects: objs, LS: list};
                }
                else {
                    objs[ObjectID] = {LS: list};
                    return {Objects: objs};
                }
            }

            dispatch('LOAD_OBJECTS', {root: root,  object: object, toServer: toServer, transform: transform});
        },

        TEST: ({state, dispatch}) => {

            /*if (state.Objects === null) {
                dispatch('INIT', {})
            }
            else {
                 for (let FirmID in state.Objects) {

                    if (state.Objects[FirmID].Objects == undefined || state.Objects[FirmID].Objects === null) {
                        dispatch('LOAD_TREE_LEVEL', {FirmID: FirmID});
                    }
                     else {
                        for (let obj in state.Objects[FirmID].Objects) {

                        dispatch('LOAD_TREE_LEVEL', {FirmID: FirmID, ObjectID: obj});
                        }
                    }
                }
            }*/


            console.log(state.Objects);
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

    }
})
