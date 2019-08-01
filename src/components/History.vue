<template>

    <center v-if="state == 'changing'">{{ message }}</center>
        
    <div v-else-if="state == 'done'" :class="{alert: true, 'alert-success': !error, 'alert-danger': error}" class="d-flex">
        <div>{{ message }}</div>
        <button @click="state = 'show'" class="flex-grow-0"><font-awesome-icon icon="times"/></button>
    </div>
    
    <div v-else>
        
        <template v-if="History !== undefined">
                
            <center v-if="History === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

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
                            <td>{{ item.Value }} <a href="#" v-if="item.NodeName" @click="showObject(item.NodeID, item.NodeName, item.NodeType)"> ( {{ item.NodeName }} )</a></td>
                        </tr>
                    </tbody>
                </table>
                
                <div v-if="type" class="d-flex">
                    
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

    </div>

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
        ...mapState(["Objects", "Types"]),
        History: function()
        {
            let data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, this.AttrType, this.AttrID, 'History']);
            
            if(data === undefined) this.reload();
            
            data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, this.AttrType, this.AttrID, 'History']);
                        
            if(!data || data.DMF_ERROR)
            {
                this.newDate = new Date();
                
                return data;
            }
                        
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
                        res[i].NodeName = data[i].NodeName;
                        res[i].NodeType = data[i].NodeType;
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
            
            return this.dataState(this.Types, [this.AttrID, 'Type']);
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
            this.LOAD_HISTORY({FirmID: this.FirmID, ObjectID: this.ObjectID, AttrType: this.AttrType, AttrID: this.AttrID});
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
            
            this.WRITE_HISTORY({operation: "add", FirmID: this.FirmID, ObjectID: this.ObjectID, AttrType: this.AttrType, AttrID: this.AttrID, date: date, value: this.newValue, accepted: accepted, rejected: rejected});
        },
        Delete: function(date)
        {            
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
            
            this.WRITE_HISTORY({operation: "delete", FirmID: this.FirmID, ObjectID: this.ObjectID, AttrType: this.AttrType, AttrID: this.AttrID, date: date, accepted: accepted, rejected: rejected})
        },
        showObject: function(ObjectID, Name, ObjectType)
        {
            this.addPanel("Object", Name, {FirmID: this.FirmID, ObjectID: ObjectID, ObjectType: ObjectType});
        }
    }
}
</script>

<style>
    
</style>