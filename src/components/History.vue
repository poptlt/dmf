<template>

    <center v-if="state == 'changing'">{{ message }}</center>
        
    <div v-else-if="state == 'done'" :class="{alert: true, 'alert-success': !error, 'alert-danger': error}" class="d-flex">
        <div>{{ message }}</div>
        <button @click="state = 'show'" class="flex-grow-0"><font-awesome-icon icon="times"/></button>
    </div>
    
    <div v-else>
        
        <template v-if="History !== undefined && type !== undefined">
                
            <center v-if="History === null || type === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

            <div v-else-if="History.DMF_ERROR" class="alert alert-danger">{{ History.message }}</div>

            <template v-else>

                <table class="table table-hover">
                    <tbody>
                        <tr v-for="item in History">
                            <td class="p-0">
                                <button v-if="item.delete" @click="Delete(item.delete)" class="btn btn-danger btn-sm m-1">
                                    <font-awesome-icon icon="times"/>
                                </button>
                            </td>
                            <td>{{ item.Date }}</td>
                            <td>{{ item.Value }} <a href="#" v-if="item.NodeID" @click="showObject(item.NodeID)"> ( {{ item.NodeName }} )</a></td>
                        </tr>
                    </tbody>
                </table>
                
                <div v-if="type.DMF_ERROR" class="alert alert-danger">{{ type.message }}</div>

                <template v-else>
                    <div class="d-flex">

                        <div class="flex-grow-0 p-1">
                            <button v-if="newValue !== undefined" @click="add" class="btn btn-success btn-sm">
                                <font-awesome-icon icon="plus"/>
                            </button>
                        </div>

                        <Datepicker ref="datepicker" v-model="newDate" :monday-first="true" :language="ru" :format="dateFormatter" :minimum-view="calendarView" :disabled-dates="disabledDates" :bootstrap-styling="true" style="width: 140px" class="flex-shrink-0"/>

                        <component :is="type.Type" v-bind="type" v-on:change="changeValue" class="mx-1"/>

                    </div>
                    <div v-if="newValue === undefined" class="alert alert-warning m-1">Значение не соответствует типу</div>
                </template>

            </template>

        </template>

    </div>

    <!--<div>
        <div>history:</div>
        <div>{{ History }}</div>
        <div>type:</div>
        <div>{{ type }}</div>
    </div>-->

</template>

<script>

import { mapActions, mapState } from 'vuex';

import Datepicker from 'vuejs-datepicker';
    
import {ru} from 'vuejs-datepicker/dist/locale';
    
import String from './Inputs/String.vue';
    
import Number from './Inputs/Number.vue';
    
import List from './Inputs/List.vue';
    
import Complex from './Inputs/Complex.vue';
    
export default {
    props: ["FirmID", "ObjectID", "AttrType", "AttrID", "addPanel"],
    components:
    {
        Datepicker, String, Number, List, Complex
    },
    data: function()
    {
        return {
            
            ru: ru,
            calendarView: (this.AttrType == "Props") ? "day" : "month",
            disabledDates:
            {
                to: new Date(1980, 0)
            },
            newValue: undefined,
            newDate: new Date(),
            
            state: "show",
            message: "",
            error: false
        }
    },
    computed:
    {
        queries: function()
        {
            let res = {history: {FirmID: this.FirmID, ObjectID: this.ObjectID, AttrID: this.AttrID}};
            
            if(this.AttrType == "Props") res.history.func = 'ObjectPropDetails';
            
            if(this.AttrType == "CalcParams") res.history.func = 'CalcParamDetails';

            if(this.AttrType == "Tariffs") res.history.func = 'TariffValueDetails';

            if(this.AttrType != "Tariffs")
            {
                res.types = {func: "DataTypes", FirmID: this.FirmID};
            }

            return res;
        },
        History: function()
        {
            let data = this.vuexLoad(this.queries).history;

            if(!data || data.DMF_ERROR) return data;
                        
            let res = [];
            
            this.disabledDates.to = new Date(1980, 0);
            
            for(let i=data.length-1; i>=0; i--)
            {
                res[i] = {Value: data[i].Value};
        
                let date = new Date(Date.parse(data[i].Date));
                                
                res[i].Date = this.dateFormatter(date);
                
                if(this.AttrType == "Props") date.setDate(date.getDate() + 1);
                else date.setMonth(date.getMonth() + 1);
                
                if(this.AttrType == "CalcParams")
                {
                    if(data[i].NodeID == this.ObjectID)
                    {
                        if(this.disabledDates.to < date)
                        {
                            this.disabledDates.to = date;
                            res[i].delete = data[i].Date;
                        }
                    }
                    else
                    {
                        res[i].NodeID = data[i].NodeID;
                        res[i].NodeName = this.vuexGet("Objects", this.FirmID, data[i].NodeID, "info", "name");
                    }
                }
                else
                {
                    if(this.disabledDates.to < date)
                    {
                        this.disabledDates.to = date;
                        res[i].delete = data[i].Date;
                    }
                }
                
            }
            
            if(this.newDate < this.disabledDates.to) this.newDate = this.disabledDates.to;
                        
            return res;
        },
        type: function()
        {
            if(this.AttrType == "Tariffs")
            {
                return {Type: "Number", NoNegative: true, Digits: 6, DigitsAfterPoint: 2};
            }

            let types = this.vuexLoad(this.queries).types;

            if(!types || types.DMF_ERROR) return types;
            
            return types[this.AttrID].Type;
        }
    },
    methods:
    {
        ...mapActions(['LOAD_HISTORY', 'WRITE_HISTORY']),
        dateFormatter: function(date)
        {                        
            if(this.AttrType == "Props") return this.dateForClient(date, "day");
            else return this.dateForClient(date, "month");
        },
        reload: function()
        {
            this.vuexClear({history: this.queries.history});

            this.newDate = new Date();
        },
        changeValue: function(val)
        {            
            this.newValue = val;
        },
        add: function()
        {
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
            
            let date = this.newDate;
            
            if(this.AttrType == "Props") date = this.dateForServer(date, "day");
            else date = this.dateForServer(date, "month");
                        
            this.state = "changing", this.message = "Добавление записи...";
            
            this.WRITE_HISTORY({operation: "add", FirmID: this.FirmID, ObjectID: this.ObjectID, AttrType: this.AttrType, AttrID: this.AttrID, date: date, value: this.newValue, query: this.queries.history, accepted: accepted, rejected: rejected});
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
            
            this.WRITE_HISTORY({operation: "delete", FirmID: this.FirmID, ObjectID: this.ObjectID, AttrType: this.AttrType, AttrID: this.AttrID, date: date, query: this.queries.history, accepted: accepted, rejected: rejected})
        },
        showObject: function(ObjectID)
        {
            let name = this.vuexGet("Objects", this.FirmID, ObjectID, "info", "name");

            this.addPanel("Object", name, {FirmID: this.FirmID, ObjectID: ObjectID});
        }
    }
}
</script>

<style>
    
</style>
