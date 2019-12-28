import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex);
import Axios from 'axios'

import { getPath, getQuery } from './functions.js'

function urlFunc() {
    if (process.env.NODE_ENV == 'production') {return '/func'}
    else {return 'http://dev2.dmf.su/func'}
}

function urlAuth() {
    if (process.env.NODE_ENV == 'production') {return '/func/login'}
    else {return 'http://dev.dmf.su/func/login'}
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
        //вот тут надо бы выкинуть ошибку, создавать ни к чему не привязанный объект нет смысла
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
        if (object[key] !== null && typeof object[key] == 'object' && Object.keys(object[key]).length > 0 && !Array.isArray(object[key])) {
            setObjectsValue(root[key], object[key], value);
        }
        // иначе вставляем в данные значение
        else {
            if (value !== undefined) {
                root[key] = value;
            }
            else {
                root[key] = object[key]
            }
        }
    }
}

function isObject(x)
{
    return (x != null && typeof(x) == "object");
}

export const store = new Vuex.Store({
  state: {
      AuthState: true,
      Objects: {},
      HardTypes: undefined,
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
        },
        INSERT: (state, {path, data}) => {

            let root = state;

            path.forEach((key, i) => {

                if(i > 0) root = root[path[i-1]];

                if(root[key] === undefined) Vue.set(root, key, {});
            })

            root[path[path.length - 1]] = data;
        },
        CLEAR: (state, path) => {
            
            store.commit('INSERT', {path: path, data: undefined});
        },
        DESTROY_TREE: (state) => {

            state["Objects"]["TreeLevel"] = undefined;

            for(let FirmID in state["Objects"])
            {
                if(FirmID != "TreeLevel")
                {
                    for(let ObjectID in state["Objects"][FirmID])
                    {
                        if(ObjectID != "DataTypes")
                        {
                            if(state["Objects"][FirmID][ObjectID]["TreeLevel"] !== undefined)
                            {
                                state["Objects"][FirmID][ObjectID]["TreeLevel"] = undefined;
                            }
                        }
                    }
                }
            }
        },
        CLEAR_TURNOVER: (state, {FirmID, LSID}) => {
            
            store.commit('INSERT', {path: ["Objects", FirmID, LSID, "GetLSTurnover"], data: undefined});
        },
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
        
        LOAD_DATA ({state, commit, dispatch}, queries)  {
            
            let toServer = ['ExecFunctions', []];

            queries.forEach((query) => {

                toServer[1].push( getQuery(query) );

                commit('INSERT', {path: getPath(query), data: null});
            });

            function accepted(data)
            {
                data = data.data;
                                
                queries.forEach((query, i) => {
                    
                    if(data[i].DMF_ERROR)
                    {
                        console.log(query);
                        
                        if(data[i].DMF_ERROR.Log !== undefined) console.log(data[i].DMF_ERROR.Log);

                        commit('INSERT', {path: getPath(query), data: {DMF_ERROR: true, message: data[i].DMF_ERROR.Message}});
                    }
                    else
                    {
                        if(query.func == "ObjectPropDetails" ||
                           query.func == "CalcParamDetails") data[i] = data[i].Data;

                        commit('INSERT', {path: getPath(query), data: data[i]});
                    }
                });
            }

            function rejected(data)
            {
                console.log(data);

                let res = [];

                for(let i=0; i<queries.length; i++) res.push(toDMFerror(data));

                accepted({data: res});
            }

            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: accepted, reject: rejected});
        },
        
        SEND_DATA: ({commit, dispatch}, {query, accepted, rejected}) => {
            
            let resolve = (data) => {
                
                switch(query.func)
                {
                    case "TariffWrite":
                    case "TariffDelete":
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.FirmID, "GetTariffs"]);
                        
                        break;
                    
                    case "TariffTOWrite":
                    case "TariffTODelete":
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.FirmID, "GetTariffsTO"]);
                        
                        break;
                    
                    case "TariffValueWrite":
                    case "TariffValueDelete":
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "Tariffs", query.AttrID, "TariffValueDetails"]);
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.FirmID, "GetTariffs"])
                        
                        break;
                        
                    case "TariffTOValueWrite":
                    case "TariffTOValueDelete":
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.FirmID, "TariffsTO", query.TariffID, "TariffTOValueDetails"]);
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.FirmID, "GetTariffsTO"]);
                        
                        break;
                    
                    case "ObjectPropWrite":
                    case "ObjectPropDelete":
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "Props", query.AttrID, "ObjectPropDetails"]);
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "GetObjectProps"]);
                        
                        break;
                        
                    case "CalcParamWrite":
                    case "CalcParamDelete":
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "CalcParams", query.AttrID, "CalcParamDetails"]);
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "GetObjectCalcParams"]);
                        
                        break;
                        
                    case "ObjectTariffTOWrite":
                    case "ObjectTariffTODelete":
                    case "ObjectHardWrite":
                    case "ObjectHardDelete":
                    case "ObjectHardWorkWrite":
                    case "ObjectHardWorkDelete":

                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "ObjectHardWorkTariffDetails"]);
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "ObjectHardWorkTariffDetails2"]);

                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "ObjectHardWorkTariffState"]);

                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "ObjectHardWorkTariffState2"]);

                        break;
                        
                    case "SetLSBalance":
                        
                        commit('CLEAR_TURNOVER', {FirmID: query.FirmID, LSID: query.LSID});
                        
                        break;
                        
                    case "LSBalanceChangeWrite":
                    case "LSBalanceChangeDelete":
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.FirmID, "Documents", query.DocumentID, "GetDoc"]);
                                                
                        commit('CLEAR_TURNOVER', {FirmID: query.FirmID, LSID: query.LSID});
                        
                        break;
                        
                    case "BankPaymentWrite":
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.FirmID, "Documents", query.DocumentID, "GetDoc"]);
                        
                        if(query.LS) commit('CLEAR_TURNOVER', {FirmID: query.FirmID, LSID: query.LS.ObjectID});
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.FirmID, "BankAccounts"]);
                        
                }
                
                accepted(data);
            };
            
            let reject = (message) => {
                                
                rejected(message);
            }
            
            console.log(getQuery(query));
            
            dispatch('SERVER_REQUEST3', {toServer: getQuery(query), accepted: resolve, rejected: reject});
        },
        
        //осталась от старого баланса для лицевого счета
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

        ADD_CALCULATION_PROCESS: ({state, commit, dispatch}, {type, FirmID, ObjectID, ldate, rdate}) => {

            if(state.Background[FirmID] === undefined || state.Background[FirmID][ObjectID] === undefined)
            {
                commit('SET_OBJECTS_VALUE', {root: state.Background, path: { [FirmID]: { [ObjectID]: [] } }, value: undefined});
            }

            let date = (type == "add") ? new Date(ldate.getTime()) : new Date(rdate.getTime());

            let process = {type: type, ldate: ldate, rdate: rdate, date: date, active: false, error: false, total: 0, done: 0, ID: "", timestamp: ""};

            state.Background[FirmID][ObjectID].push(process);

            dispatch('WRITE_CALCULATION', {process: process, FirmID: FirmID, ObjectID: ObjectID});
        },
        
        REMOVE_CALCULATION_PROCESS: ({state}, {FirmID, ObjectID, process}) => {
            
            let arr = state.Background[FirmID][ObjectID];
            
            arr.forEach((item, i) =>
            {
                if(item == process) arr.splice(i, 1);
            })
        },

        WRITE_CALCULATION: ({state, commit, dispatch}, {FirmID, ObjectID, process}) => {

            let funcName = (process.type == "add") ? "Calculation" : "CalculationDelete";

            let year = process.date.getFullYear(), month = process.date.getMonth()+1;

            let dateServer = year + "-" + (month<10 ? "0" : "") + month + "-01T00:00:00";

            let toServer = [funcName, ObjectID, FirmID, dateServer];
            
            let timestamp = new Date();

            process.timestamp = timestamp;

            let resolve = (data) => {
                
                if(process.timestamp == timestamp)
                {
                    data = data.data;

                    process.ID = data.ProcessID;

                    process.total = data.Qnt;

                    process.done = 0;

                    process.active = true;
                }
            };
            
            let reject = (data) => {

                if(process.timestamp == timestamp)
                {
                    process.error = (toDMFerror(data)).message;
                }
            };

            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
        },
        
        RELOAD_CALCULATION: ({dispatch}, {FirmID, ObjectID, process}) => {
            
            let timestamp = new Date();

            process.timestamp = timestamp;
            
            let resolve = (data) => {

                if(process.timestamp == timestamp)
                {
                    data = data.data;

                    if(data.Active) process.done = data.Qnt;
                    else
                    {
                        if(data.Error) process.error = data.Error;
                        else
                        {
                            process.active = false;

                            let add = (process.type == "add") ? 1 : -1;
                            
                            process.date.setMonth(process.date.getMonth() + add);

                            if(process.date >= process.ldate && process.date <= process.rdate)
                            {
                                dispatch('WRITE_CALCULATION', {FirmID: FirmID, ObjectID: ObjectID, process: process});
                            }
                        }
                    }
                }
            };

            let reject = (data) => {

                if(process.timestamp == timestamp)
                {
                    console.log((toDMFerror(data)).message);
                }
            };

            dispatch('SERVER_REQUEST', {toServer: ['ProcessState', process.ID], resolve: resolve, reject: reject});
        },

        RELOAD_BACKGROUND: ({state, commit, dispatch}) =>
        {
            for(let FirmID in state.Background)
            {
                for(let ObjectID in state.Background[FirmID])
                {
                    state.Background[FirmID][ObjectID].forEach((process) => {

                        if(process.active && !process.error)
                        {
                            dispatch('RELOAD_CALCULATION', {FirmID: FirmID, ObjectID: ObjectID, process: process});
                        }
                    });
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

        TEST: ({state}) => {

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

            let sendURL = (process.env.NODE_ENV == 'production') ? '/'+url : 'http://dev.dmf.su/'+url;

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
        SERVER_REQUEST2: ({state, dispatch, commit}, {toServer, accepted, rejected, url = "func"}) => {
            
            /*let resolve = (data) => { accepted(data.data) }, reject;
            
            if(toServer[0] == "ExecFunctions")
            {
                reject = (data) => {
                    
                    let res = [];
                    
                    toServer[1].forEach((query) => { res.push(toDMFerror(data)); });
                    
                    accepted(res);
                }
            }
            else
            {
                reject = (data) => { rejected(toDMFerror(data).message); };
            }
            
            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});*/
            
            
            
            // создаем промис для ожидания восстановления пользовательской сессии
            let waitAuth = new Promise((resolve) => {
                let timer = setInterval(() => {
                    if (state.AuthState) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 500);
            });

            let data = {'exec':JSON.stringify(toServer)};

            let sendURL = (process.env.NODE_ENV == 'production') ? '/'+url : 'http://dev.dmf.su/'+url;
            
            // делаем запрос на сервер
            return Axios({method: "post", timeout: 15000, url: sendURL, data: data, withCredentials: true})
                // при удачном исходе отдаем результат
                .then(response => {
                
                    response = response.data;

                    response.forEach((ans) => {
                        
                        if(isObject(ans) && ans.DMF_ERROR)
                        {
                            if(ans.DMF_ERROR.Log !== undefined) console.log(ans.DMF_ERROR.Log);
                            
                            ans.message = ans.DMF_ERROR.Message;
                            
                            ans.DMF_ERROR = true;
                        }
                    });

                    accepted(response);
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
                                dispatch('SERVER_REQUEST2', {toServer: toServer, accepted: accepted, rejected: rejected, url: url});
                            })
                    }
                    // если ошибка не связана с авторизацией, то отправляем ее на обработку
                    else
                    {
                        let res = [];
                        for(let i=0; i<toServer[1].length; i++) res.push(toDMFerror(error));
                        
                        accepted(res);
                    }
                });
        },
        SERVER_REQUEST3: ({dispatch}, {toServer, accepted, rejected}) => {
            
            let solo = false;
            
            if(toServer[0] != "ExecFunctions")
            {
                toServer = ["ExecFunctions", [toServer]], solo = true;
            }
            
            dispatch('SERVER_REQUEST2', {toServer: toServer, accepted: ready});
            
            let result = [];
            
            function ready(data)
            {
                console.log(data);
                if(!result.length) result = data;
                else
                {
                    let ptr = 0;
                    for(let i=0; i<result.length; i++)
                    {
                        if(isObject(result[i]) && result[i].DMF_PROCESS_ID)//шел процесс
                        {
                            if(!isObject(data[ptr]) || !data[ptr].DMF_PROCESS_ACTIVE)//процесс завершился
                            {
                                result[i] = data[ptr];
                            }
                            ptr++;
                        }
                    }
                }
                
                let queries = [];
                result.forEach((query) => {
                    
                    if(isObject(query) && query.DMF_PROCESS_ID)//если еще идет процесс
                    {
                        queries.push(["CheckProcess", query.DMF_PROCESS_ID]);//значит надо спрашивать
                    }
                });
                
                if(queries.length)
                {
                    setTimeout(function(){
                        
                        dispatch('SERVER_REQUEST2', {toServer: ["ExecFunctions", queries], accepted: ready});
                    }, 1000);
                }
                else
                {
                    if(solo)
                    {
                        if(isObject(result[0]) && result[0].DMF_ERROR)
                        {
                            rejected(result[0].message);
                        }
                        else accepted(result[0]);
                    }
                    else accepted(result);
                }
            }
        }
    }
})

setInterval(function(){store.dispatch('RELOAD_BACKGROUND');}, 5000);
