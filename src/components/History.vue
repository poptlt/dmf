<template>
    <div v-if="History !== undefined && type">
        
        <center v-if="History === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="History.DMF_ERROR" class="alert alert-danger">{{ History.message }}</div>
        
        <template v-else>
            
            <table class="table table-hover">
                <tbody>
                    <tr v-for="item in History">
                        <td class="p-1">
                            <button v-if="item.delete" class="btn btn-danger btn-sm">
                                <font-awesome-icon icon="times"/>
                            </button>
                        </td>
                        <td class="p-0">
                            <div class="d-flex flex-wrap">
                                <div class=" p-2">{{ item.Date }}</div>
                                <div class="p-2">{{ item.Value }}</div>
                                <div v-if="item.NodeID" class="flex-grow-0 p-2">{{ item.NodeName }}</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="p-1">
                            <button class="btn btn-success btn-sm">
                                <font-awesome-icon icon="plus"/>
                            </button>
                        </td>
                        <td class="p-0">
                            <Datepicker :value="propDate" :monday-first="true" :language="ru" :format="dateFormatter" :minimum-view="calendarView" :disabled-dates="disabledDates"/>
                            
                            <component :is="type.Type" v-bind="type" v-on:change="change"/>
                        </td>
                    </tr>
                </tbody>
            </table> 
            
        </template>
        <!--<table v-else class="table table-hover">
            <tbody>
                <tr v-for="item in History">
                    <td>{{ item.Date }}</td>
                    <td>{{ item.Value }}</td>
                </tr>
                <div class="d-flex">
                    <div><Datepicker :value="propDate" :monday-first="true" :language="ru" format="MMMM yyyy" minimum-view="month" v-on:selected="changeDate"></Datepicker></div>
                    <div><input type="text" v-model="propValue"></div>
                    <button @click="addProp">Добавить</button>
                </div>
                </tr>
                <Datepicker :value="propDate" :monday-first="true" :language="ru" :format="dateFormatter" :minimum-view="calendarView"></Datepicker>
            </tbody>
        </table>-->
        
        
        
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

import Datepicker from 'vuejs-datepicker';
    
import {ru} from 'vuejs-datepicker/dist/locale';
    
import String from './Inputs/String.vue';
    
import Number from './Inputs/Number.vue';

export default {
    props: ["FirmID", "ObjectID", "AttrType", "AttrID"],
    components:
    {
        Datepicker, String, Number
    },
    data: function()
    {
        return {
            
            ru: ru,
            propValue: '',
            propDate: new Date(),
            lastDate: new Date(1980, 1),
            calendarView: (this.AttrType == "Props") ? "day" : "month",
            disabledDates:
            {
                to: new Date(1980, 0)
            }
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
        change: function(val)
        {
            console.log(val);
        }
    }
}
</script>

<style>
    
</style>