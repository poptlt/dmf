<template>
<div>
    <table class="table table-hover">
        <tbody>
            <tr v-for="item in history">
                <td class="p-0">
                    <button v-if="item.delete" @click="Delete(item.delete)" class="btn btn-danger btn-sm m-1">
                        <font-awesome-icon icon="times"/>
                    </button>
                </td>
                <td>{{ item.Date }}</td>
                <td>{{ item.Value }} 
                    <a v-if="item.NodeID"
                       href="#"
                       @click="showObject(item.NodeID, item.NodeName, item.NodeType)">
                        ( {{ item.NodeName }} )
                    </a>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="d-flex">

        <div class="flex-grow-0 p-1">
            <button v-if="newValue !== undefined" @click="add" class="btn btn-success btn-sm">
                <font-awesome-icon icon="plus"/>
            </button>
        </div>

        <Datepicker ref="datepicker" v-model="newDate" :monday-first="true" :language="ru" :format="dateFormatter" :minimum-view="calendarView" :disabled-dates="disabledDates" :bootstrap-styling="true" style="width: 140px" class="flex-shrink-0"/>

        <component :is="type.Type" v-bind="type" v-on:change="changeValue" class="mx-1"/>

    </div>
    <div v-if="newValue === undefined"
         class="alert alert-warning m-1">
        Значение не соответствует типу
    </div>

    <!--<div>
        <div>history:</div>
        <div>{{ History }}</div>
        <div>type:</div>
        <div>{{ type }}</div>
    </div>-->
</div>
</template>

<script>

import { mapActions } from 'vuex';

import Datepicker from 'vuejs-datepicker';
    
import {ru} from 'vuejs-datepicker/dist/locale';
    
import String from './Inputs/String.vue';
    
import Number from './Inputs/Number.vue';
    
import List from './Inputs/List.vue';
    
import Complex from './Inputs/Complex.vue';
    
export default {
    props: ["FirmID", "ObjectID", "AttrType", "AttrID", "data", "types", "addPanel"],
    components:
    {
        Datepicker, String, Number, List, Complex
    },
    data: function()
    {
        console.log(this.AttrType);
        
        let res = {
            ru: ru,
            calendarView: (this.AttrType == "Props") ? "day" : "month",
            disabledDates:
            {
                to: new Date(1980, 0)
            },
            newValue: undefined,
            newDate: new Date(),
            history: []
        };
                
        for(let i = this.data.length-1; i >= 0; i--)
        {
            res.history[i] = { Value: this.data[i].Value };
            
            let date = new Date(Date.parse(this.data[i].Date));
                
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                
            res.history[i].Date = this.dateFormatter(date);
            
            if(this.AttrType == "Props") date.setDate(date.getDate() + 1);
            else date.setMonth(date.getMonth() + 1);
            
            if(this.AttrType == "CalcParams")
            {
                if(this.data[i].NodeID == this.ObjectID)
                {
                    if(res.disabledDates.to < date)
                    {
                        res.disabledDates.to = date;
                        res.history[i].delete = this.data[i].Date;
                    }
                }
                else
                {
                    res.history[i].NodeID = this.data[i].NodeID;
                    res.history[i].NodeName = this.data[i].NodeName;
                    res.history[i].NodeType = this.data[i].NodeType;
                }
            }
            else
            {
                if(res.disabledDates.to < date)
                {
                    res.disabledDates.to = date;
                    res.history[i].delete = this.data[i].Date;
                }
            }
            
            if(res.newDate < res.disabledDates.to) res.newDate = res.disabledDates.to;
            
        }
        
        return res;
    },
    computed:
    {
        /*queries: function()
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
        },*/
        type: function()
        {
            if(this.AttrType == "Tariffs")
            {
                return {Type: "Number", NoNegative: true, Digits: 6, DigitsAfterPoint: 2};
            }

            return this.types[this.AttrID].Type;
        }
    },
    methods:
    {
        ...mapActions(['SEND_DATA']),
        dateFormatter: function(date)
        {                        
            if(this.AttrType == "Props") return this.dateForClient(date, "day");
            else return this.dateForClient(date, "month");
        },
        changeValue: function(val)
        {            
            this.newValue = val;
        },
        add: function()
        {
            let change = this.$parent.change;
            
            function accepted()
            {
                change("done", "Запись добавлена");
            }
            
            function rejected(message)
            {
                change("error", "Произошла ошибка при добавлении записи: " + message);
            }
            
            let date = this.newDate;
            
            if(this.AttrType == "Props") date = this.dateForServer(date, "day");
            else date = this.dateForServer(date, "month");
                        
            change("changing", "Добавление записи");
            
            let func;
                        
            if(this.AttrType == "Props") func = "ObjectPropWrite";
            if(this.AttrType == "CalcParams") func = "CalcParamWrite";
            if(this.AttrType == "Tariffs") func = "TariffValueWrite";
            
            this.SEND_DATA({
                query: {
                    func: func,
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    AttrID: this.AttrID,
                    date: date,
                    value: this.newValue
                },
                accepted: accepted,
                rejected: rejected
            });
            
            /*this.WRITE_HISTORY({operation: "add", FirmID: this.FirmID, ObjectID: this.ObjectID, AttrType: this.AttrType, AttrID: this.AttrID, date: date, value: this.newValue, query: this.queries.history, accepted: accepted, rejected: rejected});*/
        },
        Delete: function(date)
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
            
            let func;
            
            if(this.AttrType == "Props") func = "ObjectPropDelete";
            if(this.AttrType == "CalcParams") func = "CalcParamDelete";
            if(this.AttrType == "Tariffs") func = "TariffValueDelete";
            
            this.SEND_DATA({
                query: {
                    func: func,
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    AttrID: this.AttrID,
                    date: date,
                },
                accepted: accepted,
                rejected: rejected
            });
            
            /*this.WRITE_HISTORY({operation: "delete", FirmID: this.FirmID, ObjectID: this.ObjectID, AttrType: this.AttrType, AttrID: this.AttrID, date: date, query: this.queries.history, accepted: accepted, rejected: rejected})*/
        },
        showObject: function(ID, Name, Type)
        {
            this.addPanel("Object", Name, {FirmID: this.FirmID, ObjectID: ID, Name: Name, Type: Type});
        }
    }
}
</script>

<style>
    
</style>
