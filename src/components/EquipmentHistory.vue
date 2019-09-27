<template>
<State ref="state">
    <template v-if="isData(vuexLoad(queries))">

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

                <button @click="edit('equipment', 'add', newDate[i].equipment, newEquipment[i])"
                        class="btn btn-success btn-sm ml-1 flex-grow-0">
                    <font-awesome-icon icon="plus"/>
                </button>

            </div>

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

        </div>

    </template>
    <NoData v-else :data="vuexLoad(queries)"/>
</State>
</template>

<script>

import { mapActions } from 'vuex';

import State from './State.vue';

import NoData from './NoData.vue';

import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';

export default {
    props: ["FirmID", "ObjectID"],
    components:
    {
        State, NoData, Datepicker
    },
    data: function()
    {
        return {

            ru: ru,
            queries:
            {
                history: {func: "ObjectHardDetails", FirmID: this.FirmID, ObjectID: this.ObjectID},

                kits: {func: "GetHardTypes"}
            },

            equipmentList: undefined,
            newEquipment: undefined,
            newState: undefined,
            newDate: undefined,
            disabledDates: undefined,

            prevHistory: undefined,
            prevKits: undefined
        }
    },
    computed:
    {
        history: function()
        {
            let history = this.vuexLoad(this.queries).history;

            let kits = this.vuexLoad(this.queries).kits;

            if(history !== this.prevHistory || kits !== this.prevKits)
            {

            this.equipmentList = [];

            this.newEquipment = [];

            this.newState = [];

            this.newDate = [];

            this.disabledDates = [];

            history.forEach((kit) => {

                let kitID = kit.ComplectID;

                let lastID = "-";

                let lastState = undefined;

                let lastDate = new Date(1980, 0);

                kit.List.forEach((item) => {

                    lastDate = new Date(Date.parse(item.Date));

                    lastDate.setDate(lastDate.getDate() + 1);

                    if(item.TypeID) lastID = item.TypeID, lastState = true;
                    else lastState = item.State;
                });

                let equipment = [];
                for(let ID in kits[kitID].List)
                {
                    if(ID != lastID) equipment.push({ID: ID, Name: kits[kitID].List[ID]});
                }
                if(lastID != "-") equipment.push({ID: "-", Name: "Нет оборудования"});

                this.equipmentList.push(equipment);

                this.newEquipment.push(equipment[0].ID);

                this.newState.push(lastState ? false : true);

                this.disabledDates.push({to: lastDate});

                let curDate = new Date();
                if(curDate < lastDate) curDate = lastDate;
                this.newDate.push({equipment: curDate, state: curDate});

            });
            }

            this.prevHistory = history;
            this.prevKits = kits;

            return history;
        }
    },
    methods:
    {
        ...mapActions(["WRITE_EQUIPMENT_HISTORY"]),
        dateFormatter: function(date)
        {
            return this.dateForClient(date, "day");
        },
        reload: function()
        {
            this.vuexClear(this.queries);
        },
        edit: function(type, operation, date, value)
        {
            if(operation == "add") date = this.dateForServer(date, "day");

            let state = this.$refs.state;

            function accepted()
            {
                let message;

                if(operation == "add")
                {
                    if(type == "equipment") message = "Оборудование установлено";
                    else message = "Состояние изменено";
                }
                else message = "Запись удалена";

                state.change("done", message);
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

                state.change("error", message);
            }

            let message;

            if(operation == "add")
            {
                if(type == "equipment") message = "Установка оборудования";
                else message = "Изменение состояния";
            }
            else message = "Удаление записи";

            state.change("changing", message);

            let toVuex = {

                type: type,
                operation: operation,
                FirmID: this.FirmID,
                ObjectID: this.ObjectID,
                date: date,
                accepted: accepted,
                rejected: rejected
            };

            if(type == "equipment")
            {
                if(operation == "add") toVuex.equipmentID = value;
                else toVuex.kitID = value;
            }
            if(type == "state")
            {
                if(operation == "add") toVuex.kitID = value.kitID, toVuex.state = value.state;
                else toVuex.kitID = value;
            }

            this.WRITE_EQUIPMENT_HISTORY(toVuex);
        }
    }
}
</script>

<style>

</style>
