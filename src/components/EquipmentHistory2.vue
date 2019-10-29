<template>
<div>
    <div v-for="period in periods">
        <center class="font-weight-bold">
            {{ dateForClient(new Date(Date.parse(period.date)), "day") }}
        </center>
        <div v-for="action in period.actions"
             class="d-flex p-2">
            <div style="width: 30px"
                 class="flex-shrink-0 flex-grow-0">
                <font-awesome-icon v-if="action.remove"
                                   @click="remove(action.remove)"
                                   icon="times"
                                   size="lg"
                                   class="mx-2 text-danger"
                                   style="cursor: pointer"/>
            </div>
            <div>
                <template v-if="action.type == 'tariff'">
                    Установка тарифа {{ action.name }}
                </template>

                <template v-if="action.type == 'hard'">
                    
                    <template v-if="action.name != '-'">
                        Монтаж оборудования {{ action.name }}
                    </template>

                    <template v-else>
                        Демонтаж оборудования на комплекте {{ kits[action.kitID].Name }}
                    </template>
                
                </template>

                <template v-if="action.type == 'remove'">
                    Демонтаж оборудования на комплекте {{ action.name }}
                </template>

                <template v-if="action.type == 'state'">
                    {{ action.value ? 'Включение' : 'Выключение' }}
                    оборудования на комлекте 
                    {{ kits[action.kitID].Name }}
                </template>

                <template v-if="action.object">
                     на <a href="#" @click="showObject(action.object)">
                            {{ action.object.Name }}
                        </a>
                </template>
            </div>
        </div>
        
        <div class="m-2">
        <table class="table">
            <tr v-for="equipment in period.equipment"
                :style="{'background-color': (equipment.state) ? '#ccffcc' : '#ffcccc'}">
                <td class="py-1">{{ equipment.name }}</td>
                <td class="py-1">{{ equipment.value }}</td>
            </tr>
        </table>
        </div>
    </div>

    <center class="bg-secondary text-white p-2">Новый тариф</center>
    
    <div class="d-flex align-items-center px-1 py-3">

        <button @click="addTariff"
                class="btn btn-success btn-sm mr-1 flex-grow-0">
            <font-awesome-icon icon="plus"/>
        </button>

        <Datepicker v-model="tariffDate"
                    :language="ru"
                    :format="monthFormat"
                    minimum-view="month"
                    :bootstrap-styling="true"
                    style="width: 140px"
                    class="flex-shrink-0"/>

        <select v-model="newTariff" class="form-control ml-1">
            <option v-for="tariff in tariffs" :value="tariff.TariffID">
                {{ tariff.TariffName }}
            </option>
        </select>

    </div>

    <center class="bg-secondary text-white p-2">Оборудование</center>
    
    <Datepicker v-model="equipmentDate"
                :monday-first="true"
                :language="ru"
                :format="dayFormat"
                minimum-view="day"
                :bootstrap-styling="true"
                class="m-2"/>

    <table class="table">
        <template v-for="(kit, kitID) in kits">
            <tr v-if="hard[kitID] != '-'">
                <td>Комплект {{ kit.Name }}</td>
                <td>
                    <button @click="addState(kitID, !state[kitID])"
                            class="btn btn-sm"
                            :class="{'btn-success': !state[kitID], 'btn-danger': state[kitID]}">
                        {{ state[kitID] ? 'Выключить' : 'Включить' }}
                    </button>
                </td>
            </tr>

            <tr v-for="(name, ID) in kit.List">
                <td>{{ name }}</td>
                <td>
                    <button v-if="hard[kitID] != ID"
                            @click="addEquipment(kitID, ID)"
                            class="btn btn-sm btn-primary">
                        Установить
                    </button>
                    <button v-else
                            @click="addEquipment(kitID, '-')"
                            class="btn btn-sm btn-secondary">
                        Демонтаж
                    </button>
                </td>
            </tr>
        </template>
    </table>
</div>
</template>

<script>

import { mapActions } from 'vuex';

import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';

export default {
    props: ["FirmID", "ObjectID", "history", "tariffs", "kits", "showObject"],
    components:
    {
        Datepicker
    },
    data: function()
    {
        console.log(this.kits);
        
        let data = {
            periods: [],
            ru: ru,
            newTariff: this.tariffs[0].TariffID,
            tariffDate: new Date(),
            equipmentDate: new Date(),
            
            hard: {},
            newHardFrom: {},
            state: {},
            newStateFrom: {}
        };
        
        let price = {};
        
        for(let kitID in this.kits)
        {
            data.hard[kitID] = "-";
            
            data.newHardFrom[kitID] = new Date(1980, 0);
            
            data.newStateFrom[kitID] = new Date(1980, 0);
            
            for(let equipmentID in this.kits[kitID].List) price[equipmentID] = "-";
        }
        
        let i = 0;
        
        while(i < this.history.length)
        {
            let date = this.history[i].Date, tariffs = {};
                        
            let period = {
                date: date,
                actions: [],
                equipment: []
            };
            
            while(i < this.history.length && this.history[i].Date == date)
            {
                let item = this.history[i], object = undefined;
                
                if(item.Object.ObjectID != this.ObjectID) object = item.Object;
                                
                if(item.Comment == "tariff")
                {
                    if(tariffs[item.TariffID] === undefined)
                    {
                        let t = {
                            type: "tariff",
                            name: item.TariffName,
                            object: object
                        };
                        
                        if(object === undefined)
                        {
                            t.remove = {
                                type: "tariff",
                                date: date,
                                val: item.TariffID
                            };
                        }
                        
                        period.actions.push(t);
                        
                        tariffs[item.TariffID] = true;
                    }
                    
                    price[item.TypeID] = item.TariffValue;
                }
                if(item.Comment == "hard")
                {
                    period.actions.push({
                        type: "hard",
                        name: item.TypeName,
                        kitID: item.ComplectID,
                        object: object
                    });
                    
                    data.hard[item.ComplectID] = item.TypeID;
                    data.state[item.ComplectID] = true;
                }
                if(item.Comment == "work")
                {
                    period.actions.push({
                        type: "state",
                        kitID: item.ComplectID,
                        value: item.WorkState,
                        object: object
                    });
                    
                    data.state[item.ComplectID] = item.WorkState;
                }
                
                i++;
            }
            
            for(let kitID in data.hard)
            {
                let equipmentID = data.hard[kitID];
                
                if(equipmentID != "-")
                {
                    period.equipment.push({
                        name: this.kits[kitID].List[equipmentID],
                        value: price[equipmentID],
                        state: data.state[kitID]
                    });
                }
            }
            
            data.periods.push(period);
        }
        
                
        for(let i = data.periods.length - 1; i >= 0; i--)
        {
            data.periods[i].actions.forEach((action) => {
                
                if(action.type == "hard" || action.type == "state")
                {
                    let serverDate = data.periods[i].date;

                    let date = new Date(Date.parse(serverDate));

                    date.setHours(0);

                    let kitID = action.kitID;
                    
                    if(action.type == "hard")
                    {
                        if(data.newStateFrom[kitID] < date) data.newStateFrom[kitID] = date;
                                                
                        if(!action.object)
                        {
                            date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);
                            
                            if(date > data.newHardFrom[kitID])
                            {
                                action.remove = {
                                    type: "hard",
                                    date: serverDate,
                                    val: kitID
                                };
                            }
                        }
                        
                        if(data.newHardFrom[kitID] < date) data.newHardFrom[kitID] = date;
                    }
                    if(action.type == "state")
                    {
                        if(data.newHardFrom[kitID] < date) data.newHardFrom[kitID] = date;
                        
                        if(!action.object)
                        {
                            date = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);
                            
                            if(date > data.newStateFrom[kitID])
                            {                                
                                action.remove = {
                                    type: "state",
                                    date: serverDate,
                                    val: kitID
                                };
                            }
                        }
                        
                        if(data.newStateFrom[kitID] < date) data.newStateFrom[kitID] = date;
                    }
                }
            });
        }
        
        return data;
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        monthFormat: function(date)
        {
            return this.dateForClient(date, "month");
        },
        dayFormat: function(date)
        {
            return this.dateForClient(date, "day");
        },
        remove: function({type, date, val})
        {
            let ok = confirm("Вы уверены, что хотите удалить запись?");

            if(!ok) return;
            
            let change = this.$parent.change;
            
            function accepted()
            {
                change("done", "Запись удалена");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при удалении записи: " + message);
            }
            
            change("changing", "Удаление записи");
            
            let query = {
                FirmID: this.FirmID,
                ObjectID: this.ObjectID,
                date: date
            };
            
            if(type == "tariff")
            {
                query.func = "ObjectTariffTODelete";
                query.value = val;
            }
            else
            {
                query.func = (type == "hard") ? "ObjectHardDelete" : "ObjectHardWorkDelete";
                query.kitID = val;
            }
                        
            this.SEND_DATA({
                query: query,
                accepted: accepted,
                rejected: rejected
            });
        },
        addTariff: function()
        {
            let change = this.$parent.change;
            
            function accepted()
            {
                change("done", "Тариф добавлен");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при добавлении тарифа: " + message);
            }
            
            change("changing", "Добавление тарифа");
            
            this.SEND_DATA({
                query: {
                    func: "ObjectTariffTOWrite",
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    date: this.dateForServer(this.tariffDate, "month"),
                    value: this.newTariff
                },
                accepted: accepted,
                rejected: rejected
            });
        },
        addEquipment: function(kitID, equipmentID)
        {
            if(this.equipmentDate < this.newHardFrom[kitID])
            {
                alert("На комплекте " + this.kits[kitID].Name + 
                      (equipmentID != "-" ? " монтаж" : " демонтаж") + 
                        " оборудования возможен только с " + this.dateForClient(this.newHardFrom[kitID], "day"));
                
                return;
            }
            
            let change = this.$parent.change;
            
            function accepted()
            {
                change("done", "Оборудование установлено");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при установке оборудования: " + message);
            }
            
            change("changing", "Установка оборудования");
            
            this.SEND_DATA({
                query: {
                    func: "ObjectHardWrite",
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    date: this.dateForServer(this.equipmentDate, "day"),
                    kitID: kitID,
                    equipmentID: equipmentID
                },
                accepted: accepted,
                rejected: rejected
            });
        },
        addState: function(kitID, state)
        {
            if(this.equipmentDate < this.newStateFrom[kitID])
            {
                alert("На комплекте " + this.kits[kitID].Name + " изменение состояния возможно только с " + this.dateForClient(this.newStateFrom[kitID], "day"));
                
                return;
            }
            
            let change = this.$parent.change;
            
            function accepted()
            {
                change("done", "Состояние изменено");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при изменении состояния: " + message);
            }
            
            change("changing", "Изменение состояния");
            
            this.SEND_DATA({
                query: {
                    func: "ObjectHardWorkWrite",
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    date: this.dateForServer(this.equipmentDate, "day"),
                    kitID: kitID,
                    state: state
                },
                accepted: accepted,
                rejected: rejected
            });
        }
        
    }
}
</script>