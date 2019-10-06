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
                        if(data[i].DMF_ERROR.Log !== undefined) console.log(data[i].DMF_ERROR.Log);

                        commit('INSERT', {path: getPath(query), data: {DMF_ERROR: true, message: data[i].DMF_ERROR.Message}});
                    }
                    else
                    {
                        let func = undefined;

                        //if(query.func == "TreeLevel") func = 'LOAD_TREE_LEVEL';

                        //if(query.func == "LSList") func = 'LOAD_LS_LIST';

                        //if(query.func == "GetChildrenHistoryCalcParams") func = 'LOAD_CHILDREN_HISTORY_CALC_PARAMS';

                        //if(query.func == "ObjectPropDetails") func = 'LOAD_PROPS_HISTORY';

                        //if(query.func == "CalcParamDetails") func = 'LOAD_CALC_PARAMS_HISTORY';
                        
                        if(query.func == "ObjectPropDetails" ||
                           query.func == "CalcParamDetails") data[i] = data[i].Data;

                        if(func !== undefined ) dispatch(func, {query: query, data: data[i]});
                        else commit('INSERT', {path: getPath(query), data: data[i]});
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
            
            let resolve = () => {
                
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
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "ObjectTariffTOState"]);
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "ObjectTariffTODetails"]);
                        
                        break;
                        
                    case "ObjectHardWrite":
                    case "ObjectHardDelete":
                    case "ObjectHardWorkWrite":
                    case "ObjectHardWorkDelete":
                        
                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "ObjectHardState"]);

                        commit('CLEAR', ["Objects", query.FirmID, query.ObjectID, "ObjectHardDetails"]);
                        
                        break;
                        
                }
                
                accepted();
            };
            
            let reject = (data) => {
                
                console.log(data);
                
                rejected( (toDMFerror(data)).message);
            }
            
            console.log(getQuery(query));
            
            dispatch('SERVER_REQUEST', {toServer: getQuery(query), resolve: resolve, reject: reject});
        },

        INIT: ({state, dispatch}) => {

            let transform = (data) => {

                console.log(data);

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

        LOAD_TREE_LEVEL: ({commit}, {query, data}) => {

            let nodes = [];

            if(data.DMF_ERROR) nodes = data;
            else
            {
                data.forEach((node) => {

                    nodes.push({FirmID: node.FirmID, ObjectID: node.NodeID, name: node.NodeName});

                    let info = {

                        LSQnt: node.LSQnt,
                        name: node.NodeFullName,
                        NodesQnt: node.NodesQnt,
                        Roles: node.Roles,
                        Type: node.Type
                    }

                    for(let key in info)
                    {
                        commit('INSERT', {path: ["Objects", node.FirmID, node.NodeID, "info", key], data: info[key]});
                    }
                });
            }

            commit('INSERT', {path: getPath(query), data: nodes});
        },

        LOAD_LS_LIST: ({commit}, {query, data}) => {

            let list = [];

            if(data.DMF_ERROR) list = data;
            else
            {
                data.forEach((LS) => {

                    list.push({ObjectID: LS.LSID, Balance: LS.Balance});

                    commit('INSERT', {path: ["Objects", query.FirmID, LS.LSID, "info", "Type"], data: "LS"});

                    commit('INSERT', {path: ["Objects", query.FirmID, LS.LSID, "info", "name"], data: LS.LSName});

                    commit('INSERT', {path: ["Objects", query.FirmID, LS.LSID, "info", "Number"], data: LS.Number});

                    commit('INSERT', {path: ["Objects", query.FirmID, LS.LSID, "info", "AdressAdd"], data: LS.AdressAdd});
                });
            }

            commit('INSERT', {path: getPath(query), data: list});
        },

        /*LOAD_OBJECT: ({state, dispatch}, {ObjectID, FirmID, ObjectType}) => {

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

                console.log(data);
                                
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
        },*/

        LOAD_CHILDREN_HISTORY_CALC_PARAMS: ({commit}, {query, data}) => {

            let list = [];
            
            console.log("here");
            
            data.forEach((item) => {

                list.push({Date: item.Date, ObjectID: item.ObjectID, Value: item.Value, CalcParam: item.CalcParam});

                commit('INSERT', {path: ["Objects", query.FirmID, item.ObjectID, "info", "name"], data: item.ObjectName});

                commit('INSERT', {path: ["Objects", query.FirmID, item.ObjectID, "info", "Type"], data: item.ObjectType});
            });

            commit('INSERT', {path: getPath(query), data: list});
        },
        
        /*LOAD_CHILDREN_HISTORY_CALC_PARAMS: ({state, dispatch}, {FirmID, ObjectID}) => {

            let root = state.Objects;

            let object = { [FirmID]: { [ObjectID]: { CalcParamsInfo: null } } };

            let toServer = ['GetChildrenHistoryCalcParams', ObjectID, FirmID];

            let transform = (data) => {

                object[FirmID][ObjectID]["CalcParamsInfo"] = data;

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
        },*/

        LOAD_PROPS_HISTORY: ({commit}, {query, data}) => {

            commit('INSERT', {path: getPath(query), data: data.Data});
        },

        LOAD_CALC_PARAMS_HISTORY: ({commit}, {query, data}) => {

            data = data.Data;

            let history = [];

            data.forEach((item) => {

                let cur = {Date: item.Date, Value: item.Value};

                if(item.NodeID)
                {
                    cur.NodeID = item.NodeID;

                    commit('INSERT', {path: ["Objects", query.FirmID, item.NodeID, "info", "name"], data: item.NodeName});

                    commit('INSERT', {path: ["Objects", query.FirmID, item.NodeID, "info", "Type"], data: item.NodeType});
                }

                history.push(cur);
            });

            commit('INSERT', {path: getPath(query), data: history});
        },
        
        WRITE_HISTORY: ({dispatch, commit}, {operation, ObjectID, FirmID, AttrType, AttrID, date, value, query, accepted, rejected}) => {
            
            let resolve = () => {
                
                /*dispatch('LOAD_HISTORY', {ObjectID: ObjectID, FirmID: FirmID, AttrType: AttrType, AttrID: AttrID});*/

                if(query) commit('INSERT', {path: getPath(query), data: undefined});
                
                accepted();
            }
            
            let reject = (data) => {
                
                console.log(data);

                rejected( (toDMFerror(data)).message);
            }
            
            let toServer;
            
            if(operation == "add")
            {
                if(AttrType == "Props") toServer = ['ObjectPropWrite', ObjectID, FirmID, AttrID, date, value];
                
                if(AttrType == "CalcParams") toServer = ['CalcParamWrite', ObjectID, FirmID, AttrID, date, value];
                
                if(AttrType == "Tariffs") toServer = ['TariffValueWrite', FirmID, AttrID, date, value];

                if(AttrType == "TariffsTO") toServer = ['TariffTOValueWrite', FirmID, AttrID, date, value];

                if(AttrType == "ObjectTariffTO") toServer = ['ObjectTariffTOWrite', FirmID, ObjectID, date, value];
            }
            
            if(operation == "delete")
            {
                if(AttrType == "Props") toServer = ['ObjectPropDelete', ObjectID, FirmID, AttrID, date];
                
                if(AttrType == "CalcParams") toServer = ['CalcParamDelete', ObjectID, FirmID, AttrID, date];
                
                if(AttrType == "Tariffs") toServer = ['TariffValueDelete', FirmID, AttrID, date];

                if(AttrType == "TariffsTO") toServer = ['TariffTOValueDelete', FirmID, AttrID, date];

                if(AttrType == "ObjectTariffTO") toServer = ['ObjectTariffTODelete', FirmID, ObjectID, date, value];
            }
            
            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
        },
        
        WRITE_EQUIPMENT_HISTORY: ({dispatch, commit}, {type, operation, FirmID, ObjectID, date, kitID, equipmentID, state, accepted, rejected}) => {

            let resolve = () => {

                commit('INSERT', {path: ["Objects", FirmID, ObjectID, "ObjectHardState"], data: undefined});

                commit('INSERT', {path: ["Objects", FirmID, ObjectID, "ObjectHardDetails"], data: undefined});

                accepted();
            };

            let reject = (data) => {

                console.log(data);

                rejected( (toDMFerror(data)).message);
            };

            let toServer;

            if(type == "equipment")
            {
                if(operation == "add")
                {
                    toServer = ["ObjectHardWrite", FirmID, ObjectID, date, equipmentID];
                }
                else
                {
                    toServer = ["ObjectHardDelete", FirmID, ObjectID, date, kitID];
                }
            }
            if(type == "state")
            {
                if(operation == "add")
                {
                    toServer = ["ObjectHardWorkWrite", FirmID, ObjectID, date, kitID, state];
                }
                else
                {
                    toServer = ["ObjectHardWorkDelete", FirmID, ObjectID, date, kitID];
                }
            }

            console.log(toServer);

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
        
        WRITE_TARIFF: ({state, dispatch, commit}, {operation, FirmID, TariffID, TariffName, accepted, rejected}) => {
            
            let resolve = () => {
                
                //dispatch('LOAD_OBJECT', {ObjectID: FirmID, FirmID: FirmID, ObjectType: "Firm"});

                commit('INSERT', {path: ["Objects", FirmID, FirmID, "GetTariffs"], data: undefined});
                
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
        
        WRITE_TARIFF_TO: ({dispatch, commit}, {operation, FirmID, TariffID, TariffName, accepted, rejected}) => {

            let resolve = () => {

                commit('INSERT', {path: ["Objects", FirmID, FirmID, "GetTariffsTO"], data: undefined});

                accepted();
            };

            let reject = (data) => {

                rejected((toDMFerror(data)).message);
            };

            let toServer;

            if(operation == "change") toServer = ['TariffTOWrite', FirmID, TariffID, TariffName];

            if(operation == "delete") toServer = ['TariffTODelete', FirmID, TariffID];

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
        
        /*LOAD_CALCULATION_STATE: ({state, dispatch}, {FirmID, ObjectID, date, accepted, rejected}) => {
            
            let resolve = (data) => accepted(data.data["Инфо"]);
            
            let reject = (data) => rejected((toDMFerror(data)).message);
            
            let toServer = ['CalculationState', ObjectID, FirmID, date];
            
            dispatch('SERVER_REQUEST', {toServer: toServer, resolve: resolve, reject: reject});
        },*/

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
