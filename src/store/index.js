import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
import Axios from 'axios'

function urlFunc() {
    if (process.env.NODE_ENV == 'production') {return '/func'}
    else {return 'http://dev2.dmf.su/func'}
}

function urlAuth() {
    if (process.env.NODE_ENV == 'production') {return '/func/login'}
    else {return 'http://dev2.dmf.su/func/login'}
}

function toDMFerror(error) {
    let err = {DMF_ERROR: true};

    if (error.code === 'ECONNABORTED') {
        err.message = 'Не удалось дождаться ответа от сервера!';
        err.code = 0;
    }
    else if (error.response != undefined && error.response.status != undefined && error.response.status == 500) {
        err.message = error.response.data.Message;
        err.code = 500;
    }
    else {
        err.message = 'Системная ошибка';
        err.code = 999;
    }

    if(error.response && error.response.data && error.response.data.Log)
    {
        console.log(error.response.data.Log);
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
        if (root[key] === undefined) {
            
            
            
            // то добавляем этот ключ и для начала предполагаем, что дерево продолжается дальше
            Vue.set(root, key, {});
        }
        if(root[key] === null) root[key] = {};

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
      Objects: undefined,
      Types: undefined,
      Documents: undefined,
      Background: {}
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
        DELETE_KEY: (state, {root, key}) => {
            Vue.delete(root, key);
        }
    },

    actions : {

        AUTH: (context, payload) => {
            Axios({method: "post", timeout: 15000, url: urlAuth(), data: payload, withCredentials: true})
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
                                
                return {Objects: data.Firms, Types: data.Types, Documents: {}}
            }

            dispatch('LOAD_OBJECTS', {root: state, object: {Objects: null, Types: null, Documents: null}, toServer: ['Init'], refresh: true, transform: transform});
        },

        LOAD_OBJECTS: ({state, commit, dispatch}, {root, object, toServer, refresh = true, transform = (data) => {return data}}) => {

            
            
            
            // если у нас идет обновление данных, то запрос однозначно нужно исполнить
            let request = refresh;
            // если необходимость запроса пока отсутствует, то уточняем его по данным
            if (!request) {request = checkRequest(root, object, false)}

            // если выяснилось, что запрос необходимо выполнить
            if (request) {
                                
                // добавляем в существующие данные все не существующие необходимые ключи и проставляем значение null
                commit('SET_OBJECTS_VALUE', {root: root, path: object, value: null});

                // в случае положительного ответа от сервера
                let resolve = (response) => {
                                        
                    let data = transform(response.data);
                    commit('SET_OBJECTS_VALUE', {root: root, path: data, value: undefined});
                    //setObjectsValue(root, data, undefined);

                }

                let reject = (error) => { console.log(error);
                                                             
                    commit('SET_OBJECTS_VALUE', {root: root, path: object, value: toDMFerror(error)});
                     //setObjectsValue(root, object, toDMFerror(error));
                }

                // отправляем подготовленный запрос
                dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
            }
        },

        LOAD_TREE_LEVEL: ({state, dispatch}, {FirmID, ObjectID = FirmID, hiddenEmpty = true}) => {

            let root = state.Objects[FirmID];
            let object = {[ObjectID]: {Children: null}};
            let toServer = ['TreeNodes', FirmID, ObjectID, hiddenEmpty];

            let transform = (data) => {
                let res = {[ObjectID]: {Children: []}};
                for (let i = 0; i < data.length; i++) {
                    res[ObjectID].Children.push({ObjectID: data[i].NodeID, Name:  data[i].NodeName});
                    res[ data[i].NodeID] = {Type: data[i].Type, Name: data[i].NodeFullName, ChildrenQnt: data[i].NodesQnt, LSQnt: data[i].LSQnt};
                }
                return res;
            }

            dispatch('LOAD_OBJECTS', {root: root,  object: object, toServer: toServer, transform: transform});
        },

        LOAD_LS_LIST: ({state, dispatch}, {FirmID, ObjectID = FirmID}) => {
                        
            let root = state.Objects;

            let object = { [FirmID]: {[ObjectID]: {LS: null}} };

            let toServer = ['LSList', ObjectID, FirmID];

            let transform = (data) => {
                
                
                object[FirmID][ObjectID].LS = [];

                for (let i = 0; i < data.length; i++) {
                    object[FirmID][ObjectID].LS.push({ObjectID: data[i].LSID, Balance: data[i].Balance});
                    object[FirmID][ data[i].LSID] = {Type: 'LS', Name: data[i].LSName, Number: data[i].Number, AdressAdd: data[i].AdressAdd};
                }
                return object;
            }

            dispatch('LOAD_OBJECTS', {root: root,  object: object, toServer: toServer, transform: transform});
        },

        LOAD_OBJECT: ({state, dispatch}, {ObjectID, FirmID, ObjectType}) => {

            let root = state.Objects;

            let object = { [FirmID]: {[ObjectID]: {Props: null, CalcParams: null}} };

            if (ObjectType == 'Firm') {
                object[FirmID][ObjectID]['Tariffs'] = null;
                object[FirmID][ObjectID]['BankAccounts'] = null;
            }
            if (ObjectType == 'LS') {
                object[FirmID][ObjectID]['Turnover'] = null;
            }

            let toServer = ['GetObject', ObjectID, FirmID];

            let transform = (data) => {
                
                data = data.Data; //ключи ObjectName и ObjectType уже не нужны
                                
                let props = data.Props, idCnt=1;
                
                data.Props = {};
                
                props.forEach(item => {
                    
                    let id = item.PropID;
                    if(!item.Editable) id = "id"+idCnt, idCnt++;
                    
                    data.Props[id] = {PropName: item.PropName, Value: item.Value, Editable: item.Editable};
                });
                
                let params = data.CalcParams;
                
                data.CalcParams = {};
                
                params.forEach(item => {
                    
                    data.CalcParams[item.ParamID] = {ParamName: item.ParamName, Value: item.Value};
                });
                
                if(data.Tariffs)
                {
                    let tariffs = data.Tariffs;
                    
                    data.Tariffs = {};
                    
                    tariffs.forEach(item => {
                        
                        data.Tariffs[item.TariffID] = {TariffName: item.TariffName, Value: item.Value};
                    })
                }
                
                object[FirmID][ObjectID] = data;

                return object;
            }

            dispatch('LOAD_OBJECTS', {root: root,  object: object, toServer: toServer, transform: transform});
        },
        
        LOAD_HISTORY: ({state, dispatch}, {ObjectID, FirmID, AttrType, AttrID}) => {
            
            let root = state.Objects;
            
            let object = { [FirmID]: { [ObjectID]: { [AttrType]: { [AttrID]: { 'History': null } } } } };
            
            let toServer;
            
            if(AttrType == "Props") toServer = ['ObjectPropDetails', ObjectID, FirmID, AttrID];
            
            if(AttrType == "CalcParams") toServer = ['CalcParamDetails', ObjectID, FirmID, AttrID];
            
            if(AttrType == "Tariffs") toServer = ['TariffValueDetails', FirmID, AttrID];
            
            let transform = (data) => {
                                
                if(AttrType != "Tariffs") data = data.Data;
                
                object[FirmID][ObjectID][AttrType][AttrID]['History'] = data;
                
                return object;
            }
            
            dispatch('LOAD_OBJECTS', {root: root,  object: object, toServer: toServer, transform: transform});
        },
        
        WRITE_HISTORY: ({state, dispatch}, {operation, ObjectID, FirmID, AttrType, AttrID, date, value, accepted, rejected}) => {
            
            let resolve = () => {
                
                dispatch('LOAD_HISTORY', {ObjectID: ObjectID, FirmID: FirmID, AttrType: AttrType, AttrID: AttrID});
                
                accepted();
            }
            
            let reject = (data) => {
                
                rejected( (toDMFerror(data)).message);
            }
            
            let toServer;
            
            if(operation == "add")
            {
                if(AttrType == "Props") toServer = ['ObjectPropWrite', ObjectID, FirmID, AttrID, date, value];
                
                if(AttrType == "CalcParams") toServer = ['CalcParamWrite', ObjectID, FirmID, AttrID, date, value];
                
                if(AttrType == "Tariffs") toServer = ['TariffValueWrite', FirmID, AttrID, date, value];
            }
            
            if(operation == "delete")
            {
                if(AttrType == "Props") toServer = ['ObjectPropDelete', ObjectID, FirmID, AttrID, date];
                
                if(AttrType == "CalcParams") toServer = ['CalcParamDelete', ObjectID, FirmID, AttrID, date];
                
                if(AttrType == "Tariffs") toServer = ['TariffValueDelete', FirmID, AttrID, date];
            }
            
            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
        },
        
        LOAD_DOCUMENT: ({state, dispatch}, {DocumentID}) => {
        
            let root = state.Documents;
            
            let object = { [DocumentID]: null };
            
            let toServer = ['GetDoc', DocumentID];
            
            let transform = (data) => {
                                
                object[DocumentID] = data;
                
                return object;
            }
            
            dispatch('LOAD_OBJECTS', {root: root,  object: object, toServer: toServer, transform: transform});
        },
        
        WRITE_TARIFF: ({state, dispatch}, {operation, FirmID, TariffID, TariffName, accepted, rejected}) => {
            
            let resolve = () => {
                
                dispatch('LOAD_OBJECT', {ObjectID: FirmID, FirmID: FirmID, ObjectType: "Firm"});
                
                accepted();
            };
            
            let reject = (data) => {
                
                rejected((toDMFerror(data)).message);
            };
            
            let toServer;
            
            if(operation == "change") toServer = ['TariffWrite', FirmID, TariffID, TariffName];
            
            if(operation == "delete") toServer = ['TariffDelete', FirmID, TariffID];
            
            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
        },
        
        WRITE_START_BALANCE: ({state, dispatch}, {FirmID, ObjectID, value, accepted, rejected}) => {
            
            let resolve = () => {
                
                dispatch('LOAD_OBJECT', {ObjectID: ObjectID, FirmID: FirmID, ObjectType: "LS"});
                
                accepted();
            };
            
            let reject = (data) => {
                
                rejected((toDMFerror(data)).message);
            };
            
            let toServer = ['SetLSBalance', ObjectID, value];
            
            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
        },
        
        LOAD_CALCULATION_STATE: ({state, dispatch}, {FirmID, ObjectID, date, accepted, rejected}) => {
            
            let resolve = (data) => accepted(data.data["Инфо"]);
            
            let reject = (data) => rejected((toDMFerror(data)).message);
            
            let toServer = ['CalculationState', ObjectID, FirmID, date];
            
            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
        },
        
        WRITE_CALCULATION: ({state, commit, dispatch}, {operation, ObjectID, FirmID, dateClient, dateServer, accepted, rejected}) => {
            
            let funcName = (operation == "add") ? "Calculation" : "CalculationDelete";
            
            let toServer = [funcName, ObjectID, FirmID, dateServer];
            
            let resolve = (data) => {
                
                data = data.data;
                
                let ProcessID = data.ProcessID;
                
                let obj = {[FirmID]: {[ObjectID]: {[ProcessID]: {}}}};
                
                let process = obj[FirmID][ObjectID][ProcessID];
                
                process.Total = data.Qnt;
                
                process.Done = 0;
                
                process.Active = true;
                
                process.Type = (operation == "add") ? "начисление" : "удаление начисления";
                
                process.Date = dateClient;
                
                commit('SET_OBJECTS_VALUE', {root: state.Background, path: obj, value: undefined});
            }
            
            let reject = (data) => {
                                
                console.log((toDMFerror(data)).message);
            }
                        
            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
        },
        
        REMOVE_CALCULATION: ({state, commit}, {FirmID, ObjectID, ProcessID}) => {
            
            commit('DELETE_KEY', {root: state.Background[FirmID][ObjectID], key: ProcessID});
            
            if(Object.keys(state.Background[FirmID][ObjectID]).length == 0)
            {
                commit('DELETE_KEY', {root: state.Background[FirmID], key: ObjectID});
            }
            
            if(Object.keys(state.Background[FirmID]).length == 0)
            {
                commit('DELETE_KEY', {root: state.Background, key: FirmID});
            }
        },
        
        RELOAD_BACKGROUND: ({state, commit, dispatch}) =>
        {
            for(let firm in state.Background)
            {
                for(let object in state.Background[firm])
                {
                    for(let processID in state.Background[firm][object])
                    {
                        let process = state.Background[firm][object][processID];
                        
                        if(process && process.Active)
                        {
                            function accepted(data)
                            {
                                data = data.data;
                                
                                let obj = {};
                                
                                if(data.Active) obj.Done = data.Qnt;
                                else
                                {
                                    obj.Active = false;
                                    
                                    if(data.Error) obj.Error = data.Error;
                                    else
                                    {
                                        obj.Done = data.Qnt;
                                        obj.Total = data.Qnt;
                                    }
                                }
                                
                                commit('SET_OBJECTS_VALUE', {root: process, path: obj, value: undefined});
                            }
                            
                            function rejected(data)
                            {
                                console.log((toDMFerror(data)).message);
                            }
                            
                            dispatch('SERVER_REQUEST', {toServer: ['ProcessState', processID], resolve: accepted, reject: rejected});
                        }
                    }
                }
            }
        },
        
        FIND_LS: ({dispatch}, {str, func, timestamp}) => {
            
            if(str.length < 5) func("Ничего не найдено", timestamp);
            else
            {
                let resolve = (data) => {
                    
                    data = data.data;
                    if(data)
                    {
                        if(data.length) func(data, timestamp);
                        else func("Ничего не найдено", timestamp);
                    }
                    else func("Слишком много", timestamp);
                }
                
                let reject = (data) => {
                    
                    func("Ошибка при поиске: " + (toDMFerror(data)).message, timestamp);
                }
                
                dispatch('SERVER_REQUEST', {toServer: ['FindLS', str], resolve: resolve, reject: reject});
            }
            
        },

        GET_URL: ({dispatch}, {ID, accepted, rejected}) => {

            let resolve = (data) => {accepted(data.data.url)}

            let reject = (data) => {rejected((toDMFerror(data)).message)}

            dispatch('SERVER_REQUEST', {toServer: {'guid': ID, 'days': 30}, resolve: resolve, reject: reject, url: "func/geturl"});
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


            console.log(state);

        },

        SERVER_REQUEST: ({state, commit, dispatch}, {toServer, resolve, reject, url = 'func'}) => {

            // создаем промис для ожидания восстановления пользовательской сессии
            let waitAuth = new Promise((resolve) => {
                let timer = setInterval(() => {
                    if (state.AuthState) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 500);
            });

            //let url = "http://dev2.dmf.su/func";
            let data = {'exec':JSON.stringify(toServer)};

            let sendURL = (process.env.NODE_ENV == 'production') ? '/'+url : 'http://dev2.dmf.su/'+url;

            // делаем запрос на сервер
            return Axios({method: "post", timeout: 15000, url: sendURL/*urlFunc()*/, data: data, withCredentials: true})
                // при удачном исходе отдаем результат
                .then(response => {
                    resolve(response);
                })
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
                                dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject, url: url});
                            })
                    }
                    // если ошибка не связана с авторизацией, то отправляем ее на обработку
                    else {reject(error)}
                });
        },

    }
})

setInterval(function(){store.dispatch('RELOAD_BACKGROUND');}, 5000);
