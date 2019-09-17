<template>
    <center v-if="state == 'changing'">{{ message }}</center>

    <div v-else-if="state == 'done'" :class="{alert: true, 'alert-success': !error, 'alert-danger': error}" class="d-flex">
        <div>{{ message }}</div>
        <button @click="state = 'show'" class="flex-grow-0"><font-awesome-icon icon="times"/></button>
    </div>

    <div v-else-if="history !== undefined">

        <center v-if="!history" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="history.DMF_ERROR" class="alert alert-danger">{{ history.message }}</div>

        <template v-else>

            <div v-for="item in history">

                <div class="d-flex align-items-center p-2">

                    <button @click="Delete(item.date)" class="btn btn-danger btn-sm flex-grow-0">
                            <font-awesome-icon icon="times"/>
                    </button>

                    <div class="ml-2">{{ dateForClient(item.date, "month") }}</div>
                </div>

                <table class="table table-bordered">
                    <template v-for="(kit, kitName) in item.value">
                        <tr v-for="(equipment, i) in kit">
                            <td v-if="i==0" :rowspan="kit.length">{{ kitName }}</td>

                            <td>{{ equipment.name }}</td>

                            <td>{{ equipment.value }}</td>
                        </tr>
                    </template>
                </table>
            </div>

            <div class="d-flex align-items-center p-2">

                <button v-if="newValue" @click="add" class="flex-grow-0 btn btn-success btn-sm mr-2">
                    <font-awesome-icon icon="plus"/>
                </button>

                <Datepicker v-model="newDate" :monday-first="true" :language="ru" :format="dateFormatter" minimum-view="month" :bootstrap-styling="true"/>

            </div>

            <table class="table table-bordered">
                <template v-for="(kit, kitID) in input">
                    <tr v-for="(equipment, i) in kit.List">
                        <td v-if="i==0" :rowspan="kit.List.length">{{ kit.Name }}</td>

                        <td>{{ equipment.Name }}</td>

                        <td class="p-1" align="center"><Number @change="equipment.onChange" :NoNegative="true" :Digits="5" :DigitsAfterPoint="2" :CanBeEmpty="true" style="width: 75px"/></td>
                    </tr>
                </template>
            </table>

            <div v-if="newValue === undefined" class="alert alert-warning m-1">Значение не соответствует типу</div>

        </template>

    </div>
</template>

<script>

import Vue from 'vue';

import { mapActions } from 'vuex';

import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';

import Number from './Inputs/Number.vue';

export default {
    props: ["FirmID", "TariffID"],
    components:
    {
        Datepicker, Number
    },
    data: function()
    {
        return {

            ru: ru,

            newDate: new Date(),
            inputValue: {},

            state: "show",
            message: "",
            error: false,

            queries:
            {
                history: {func: "TariffTOValueDetails", FirmID: this.FirmID, TariffID: this.TariffID},
                type: {func: "GetHardTypes"}
            }
        }
    },
    computed:
    {
        history: function()
        {
            let history = this.vuexLoad(this.queries).history;

            if(!history || history.DMF_ERROR) return history;

            if(!this.type || this.type.DMF_ERROR) return this.type;

            let res = [];

            this.newDate = new Date();

            history.forEach((item) => {

                let cur = {date: new Date(Date.parse(item.Date)), value: {} };

                for(let kitID in item.Value)
                {
                    cur.value[this.type[kitID].Name] = [];

                    for(let equipmentID in item.Value[kitID])
                    {
                        let name = this.type[kitID].List[equipmentID];

                        let value = item.Value[kitID][equipmentID];

                        cur.value[this.type[kitID].Name].push({name: name, value: value});
                    }
                }

                res.push(cur);
            });

            return res;
        },
        type: function()
        {
            return this.vuexLoad(this.queries).type;
        },
        input: function()
        {
            let res = {};

            for(let kitID in this.type)
            {
                res[kitID] = {Name: this.type[kitID].Name, List: []};

                for(let equipmentID in this.type[kitID].List)
                {
                    let root = this.inputValue;

                    let onChange = (val) => {

                        if(!root[kitID]) Vue.set(root, kitID, {});

                        if(!root[kitID][equipmentID]) Vue.set(root[kitID], equipmentID, val);
                        else root[kitID][equipmentID] = val;
                    }

                    res[kitID].List.push({ID: equipmentID, Name: this.type[kitID].List[equipmentID], onChange: onChange});
                }
            }
            return res;
        },
        newValue: function()
        {
            let res = [];

            for(let kitID in this.inputValue)
            {
                for(let equipmentID in this.inputValue[kitID])
                {
                    let val = this.inputValue[kitID][equipmentID];

                    if(val === undefined) return undefined;

                    if(val !== null)
                    {
                        res.push({kitID: kitID, equipmentID: equipmentID, value: val});
                    }
                }
            }

            if(res.length) return res;
            else return undefined;
        }
    },
    methods:
    {
        ...mapActions(['WRITE_HISTORY']),
        reload: function()
        {
            let res = {history: this.queries.history};

            if(this.type && this.type.DMF_ERROR) res.type = this.queries.type;

            this.vuexClear(res);
        },
        dateFormatter: function(date)
        {
            return this.dateForClient(date, "month");
        },
        add: function()
        {
            //console.log(JSON.stringify(this.newValue));

            let th = this;

            function accepted()
            {
                th.state = "done", th.error = false;
                th.message = "Запись добавлена";
            }

            function rejected(message)
            {
                th.state = "done", th.error = true;
                th.message = "Произошла ошибка при добавлении записи: " + message;
            }

            let date = this.dateForServer(this.newDate, "month");

            this.state = "changing", this.message = "Добавление записи...";

            this.WRITE_HISTORY({operation: "add", FirmID: this.FirmID, AttrType: "TariffsTO", AttrID: this.TariffID, date: date, value: this.newValue, query: this.queries.history, accepted: accepted, rejected: rejected});
        },
        Delete: function(date)
        {
            let ok = confirm("Вы уверены, что хотите удалить запись?");

            if(!ok) return;

            let th = this;

            function accepted()
            {
                th.state = "done", th.error = false;
                th.message = "Запись удалена";
            }

            function rejected(message)
            {
                th.state = "done", th.error = true;
                th.message = "Произошла ошибка при удалении записи: " + message;
            }

            this.state = "changing", this.message = "Удаление записи...";

            date = this.dateForServer(date, "month");

            this.WRITE_HISTORY({operation: "delete", FirmID: this.FirmID, AttrType: "TariffsTO", AttrID: this.TariffID, date: date, query: this.queries.history, accepted: accepted, rejected: rejected});
        }
    }
}
</script>

<style>

</style>
