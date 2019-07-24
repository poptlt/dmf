<template>
    <div v-if="History !== undefined">
        
        <div v-if="waiting">waiting...</div>
        
        <center v-else-if="History === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="History.DMF_ERROR" class="alert alert-danger">{{ History.message }}</div>
        
        <template v-else>
            
            <table class="table table-hover">
                <tbody>
                    <tr v-for="item in History">
                        <td>
                            <button v-if="item.delete" class="btn btn-danger btn-sm m-1">
                                <font-awesome-icon icon="times"/>
                            </button>
                        </td>
                        <td>{{ item.Date }}</td>
                        <td>{{ item.Value }}<span v-if="item.NodeName"> ( {{ item.NodeName }} )</span></td>
                    </tr>
                </tbody>
            </table>
            <div v-if="type" class="d-flex">
                <button v-if="newValue !== undefined" @click="add" class="btn btn-success btn-sm">
                    <font-awesome-icon icon="plus"/>
                </button>

                <Datepicker :value="newDate" :monday-first="true" :language="ru" :format="dateFormatter" :minimum-view="calendarView" :disabled-dates="disabledDates" :bootstrap-styling="true" style="width: 120px"/>

                <component :is="type.Type" v-bind="type" v-on:change="changeValue"/>

            </div>
            
            
        </template>
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

import Datepicker from 'vuejs-datepicker';
    
import {ru} from 'vuejs-datepicker/dist/locale';
    
import String from './Inputs/String.vue';
    
export default {
    props: ["FirmID", "ObjectID", "AttrType", "AttrID"],
    components:
    {
        Datepicker, String
    },
    data: function()
    {
        return {
            
            ru: ru,
            lastDate: new Date(1980, 1),
            calendarView: (this.AttrType == "Props") ? "day" : "month",
            disabledDates:
            {
                to: new Date(1980, 0)
            },
            newValue: undefined,
            newDate: new Date(),
            waiting: false,
            message: undefined
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
            
            //if(!this.Types) return null;
            
            if(!data || data.DMF_ERROR) return data;
            
            console.log(data);
            
            let res = [];
            
            this.disabledDates.to = new Date(1980, 0);
            
            for(let i=data.length-1; i>=0; i--)
            {
                res[i] = {Value: data[i].Value};
        
                let date = new Date(Date.parse(data[i].Date));
                                
                res[i].Date = this.dateFormatter(date);
                
                if(this.AttrType == "Props") date.setDate(date.getDate() + 1);
                else date.setDate(date.getMonth() + 1);
                
                if(this.AttrType == "CalcParams")
                {
                    if(data[i].NodeID == this.ObjectID)
                    {
                        date.
                        if(this.disabledDates.to < date)
                        {
                            this.disabledDates.to = date;
                            res[i].delete = true;
                        }
                    }
                    else res[i].NodeID = data[i].NodeID, res[i].NodeName = data[i].NodeName;
                }
                else
                {
                    if(this.disabledDates.to < date)
                    {
                        this.disabledDates.to = date;
                        res[i].delete = true;
                    }
                }
                
            }
            
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
        /*reload: function()
        {
            this.LOAD_PROP_HISTORY({FirmID: this.FirmID, ObjectID: this.ObjectID, PropID: this.PropID});
        },
        addProp: function()
        {
            function func(res)
            {
                if(res.error)
                {
                    console.log("Ошибка: "+res.message);
                }
                else console.log("Все ок");
            }
            
            this.WRITE_PROP({ObjectID: this.ObjectID, FirmID: this.FirmID, PropID: this.PropID, Date: this.propDate.toISOString(), Value: this.propValue, func: func});
        },
        changeDate: function(Date)
        {
            this.propDate = Date;
        },*/
        dateFormatter: function(date)
        {            
            let year = date.getFullYear(), month = date.getMonth(), day = date.getDate();
            
            if(this.AttrType == "Props")
            {
                return (day<10 ? "0" : "") + day + "." + (month+1<10 ? "0" : "") + (month + 1) + "." + year;
            }
            else
            {
                return this.monthNames[month] + " " + year;    
            }
        },
        reload: function()
        {
            this.LOAD_HISTORY({FirmID: this.FirmID, ObjectID: this.ObjectID, AttrType: this.AttrType, AttrID: this.AttrID});
        },
        changeDate: function(date)
        {
            this.newDate = date;
        },
        changeValue: function(val)
        {
            this.newValue = val;
        },
        clear: function()
        {
            this.$refs.input.clear();
        },
        add: function()
        {
            let th = this;
            
            function ok()
            {
                th.waiting = false;
            }
            
            function error(message)
            {
                th.waiting = false;
                
                alert(message);
            }
            
            this.waiting = true;
            
            this.WRITE_HISTORY({FirmID: this.FirmID, ObjectID: this.ObjectID, AttrType: this.AttrType, AttrID: this.AttrID, date: this.newDate, value: this.newValue})
        }
    }
}
</script>

<style>
    
</style>