<template>
<div>
    <div v-for="(kit, i) in history" class="mb-4">

        <div class="text-center font-weight-bold p-2">
            {{ kit.ComplectName }}
        </div>

        <table class="table">
            <tr v-for="(item, j) in kit.List">

                <td class="px-1">
                    <button v-if="j == kit.List.length-1"
                            @click="edit((item.TypeID) ? 'equipment' : 'state', 'delete', item.Date, kit.ComplectID)"
                            class="btn btn-danger btn-sm">
                        <font-awesome-icon icon="times"/>
                    </button>
                </td>

                <td>{{ dateForClient(new Date(Date.parse(item.Date)), 'day') }}</td>
                <td v-if="item.TypeID">Установлено: {{ item.TypeName }}</td>
                <td v-else>{{ (item.State) ? 'Включено' : 'Выключено' }}</td>
            </tr>
        </table>

        <div class="mx-2">Установить оборудование:</div>
        <div class="d-flex align-items-center p-1">

            <Datepicker v-model="newDate[i].equipment"
                        :disabled-dates="disabledDates[i]"
                        :monday-first="true"
                        :language="ru"
                        :format="dateFormatter"
                        minimum-view="day"
                        :bootstrap-styling="true"
                        style="width: 110px"
                        class="flex-shrink-0"/>

            <select v-model="newEquipment[i]" class="form-control ml-1">
                <option v-for="equipment in equipmentList[i]" :value="equipment.ID">
                    {{ equipment.Name }}
                </option>
            </select>

            <button @click="edit('equipment', 'add', newDate[i].equipment, {kitID: kit.ComplectID, equipmentID: newEquipment[i]})"
                    class="btn btn-success btn-sm ml-1 flex-grow-0">
                <font-awesome-icon icon="plus"/>
            </button>

        </div>

        <template v-if="newState[i] !== null">
            <div class="mx-2">Изменить состояние:</div>
            <div class="d-flex align-items-center p-1">

                <Datepicker v-model="newDate[i].state"
                            :disabled-dates="disabledDates[i]"
                            :monday-first="true" :language="ru"
                            :format="dateFormatter"
                            minimum-view="day"
                            :bootstrap-styling="true"
                            style="width: 110px"
                            class="flex-grow-0"/>

                <button @click="edit('state', 'add', newDate[i].state, {kitID: kit.ComplectID, state: newState[i]})"
                        class="btn btn-sm ml-1 flex-grow-0"
                        :class="{'btn-success': newState[i], 'btn-danger': (!newState[i])}">
                    {{ newState[i] ? 'Включить' : 'Выключить' }}
                </button>

            </div>
        </template>

    </div>
</div>
</template>

<script>

import { mapActions } from 'vuex';
    
import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';
    
export default {
    props: ["FirmID", "ObjectID", "history", "kits"],
    components:
    {
        Datepicker
    },
    data: function()
    {        
        let res = {ru: ru};
        
        res.equipmentList = [];

        res.newEquipment = [];

        res.newState = [];

        res.newDate = [];

        res.disabledDates = [];

        this.history.forEach((kit) => {

            let kitID = kit.ComplectID;

            let lastID = "-";

            let lastState = undefined;

            let lastDate = new Date(1980, 0);

            kit.List.forEach((item) => {

                let date = new Date(Date.parse(item.Date));
                
                lastDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1);
                                
                if(item.TypeID) lastID = item.TypeID, lastState = true;
                else lastState = item.State;
            });

            let equipment = [];
            for(let ID in this.kits[kitID].List)
            {
                if(ID != lastID) equipment.push({ID: ID, Name: this.kits[kitID].List[ID]});
            }
            if(lastID != "-") equipment.push({ID: "-", Name: "Нет оборудования"});

            res.equipmentList.push(equipment);

            res.newEquipment.push(equipment[0].ID);

            res.newState.push(lastState ? false : true);

            res.disabledDates.push({to: lastDate});

            let curDate = new Date();
            if(curDate < lastDate) curDate = lastDate;
            res.newDate.push({equipment: curDate, state: curDate});

        });
        
        return res;
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        dateFormatter: function(date)
        {
            return this.dateForClient(date, "day");
        },
        edit: function(type, operation, date, value)
        {
            if(operation == "add") date = this.dateForServer(date, "day");

            let change = this.$parent.change;
            
            function accepted()
            {
                let message;

                if(operation == "add")
                {
                    if(type == "equipment") message = "Оборудование установлено";
                    else message = "Состояние изменено";
                }
                else message = "Запись удалена";

                change("done", message);
            }

            function rejected(error)
            {
                let message = "Произошла ошибка при ";

                if(operation == "add")
                {
                    if(type == "equipment") message += "установке оборудования";
                    else message += "изменении состояния";
                }
                else message += "удалении записи";

                message += ": " + error;

                change("error", message);
            }

            let message;

            if(operation == "add")
            {
                if(type == "equipment") message = "Установка оборудования";
                else message = "Изменение состояния";
            }
            else message = "Удаление записи";

            change("changing", message);

            let query = {

                FirmID: this.FirmID,
                ObjectID: this.ObjectID,
                date: date,
            };

            if(type == "equipment")
            {
                if(operation == "add")
                {
                    query.func = "ObjectHardWrite";
                    query.kitID = value.kitID;
                    query.equipmentID = value.equipmentID;
                }
                else
                {
                    query.func = "ObjectHardDelete";
                    query.kitID = value;
                }
            }
            if(type == "state")
            {
                if(operation == "add")
                {
                    query.func = "ObjectHardWorkWrite";
                    query.kitID = value.kitID;
                    query.state = value.state;
                }
                else
                {
                    query.func = "ObjectHardWorkDelete";
                    query.kitID = value;
                }
            }

            this.SEND_DATA({query: query, accepted: accepted, rejected: rejected});
        }
    }
}
</script>

<style>
    
</style>