<template>
    <div>
        <div class="d-flex flex-wrap">
            <div class="d-flex">
                <div class="m-1 flex-grow-0" style="width: 20px">с</div>

                <Datepicker v-model="ldate" @selected="ldateChanged" :monday-first="true" :language="ru" :format="dateFormatter" minimum-view="month" :bootstrap-styling="true" class="m-1" style="min-width: 300px"/>
            </div>
            <div class="d-flex">
                <div class="m-1 flex-grow-0" style="width: 20px">по</div>

                <Datepicker v-model="rdate" @selected="rdateChanged" :monday-first="true" :language="ru" :format="dateFormatter" minimum-view="month" :bootstrap-styling="true" class="m-1" style="min-width: 300px"/>
            </div>
        </div>
        
        <div class="d-flex justify-content-center">
            <button @click="addCalculation('add')" class="flex-grow-0 btn btn-primary btn-sm m-1">Начислить</button>

            <button @click="addCalculation('delete')" class="flex-grow-0 btn btn-primary btn-sm m-1">Отменить начисления</button>
        </div>
        
        <center v-if="calculations.length" class="mt-2"><h5>Процессы</h5></center>
        
        <div v-for="item in calculations" class="d-flex align-items-start border-top p-2">
            
            <button v-if="item.delete" @click="removeCalculation(item.delete)" class="flex-grow-0 btn btn-danger btn-sm mr-2">
                <font-awesome-icon icon="times"/>
            </button>

            <div>
                
                <div v-if="item.done" class="my-1">{{ item.done }}</div>

                <div v-if="item.doing" class="my-1">

                    <div>{{ item.doing.text }}</div>

                    <div class="progress bg-secondary">
                            <div class="progress-bar" :style="{width: (item.doing.done / item.doing.total * 100) + '%'}">{{ item.doing.done }} / {{ item.doing.total }}</div>
                    </div>

                </div>

                <div v-if="item.todo" class="my-1">{{ item.todo }}</div>

                <div v-if="item.error" class="alert alert-danger mb-0">{{ item.error }}</div>

            </div>

            <!--<div v-for="(val, key) in item" class="d-flex">
                <div class="flex-grow-0">{{ key }}: </div>
                <div v-if="key != 'ldate' && key != 'rdate' && key != 'date'"> {{ val }}</div>
                <div v-else> {{ val.getFullYear() }} {{ val.getMonth() }}</div>
            </div>-->
        </div>

    </div>
</template>

<script>
    
import { mapActions, mapState } from 'vuex';

import Datepicker from 'vuejs-datepicker';
    
import {ru} from 'vuejs-datepicker/dist/locale';
    
export default {
    props: ["FirmID", "ObjectID"],
    components:
    {
        Datepicker
    },
    data: function()
    {
        return {
            
            ru: ru,
            ldate: new Date(),
            rdate: new Date()
        }
    },
    computed:
    {
        ...mapState(["Background"]),
        calculations: function()
        {            
            let data = this.dataState(this.Background, [this.FirmID, this.ObjectID]);
            
            if(!data) return [];
            
            let res = [];
            
            data.forEach((item) => {

                let cur = {};

                let l1 = item.ldate, r1 = new Date(item.date.getTime());

                r1.setMonth(r1.getMonth() - 1);

                if(item.type == "delete" && !item.active) r1 = item.date;

                let l2 = new Date(item.date.getTime()), r2 = item.rdate;

                l2.setMonth(l2.getMonth() + 1);

                if(item.type == "add" && !item.active) l2 = item.date;


                if(item.type == "add" && l1 <= r1)
                {
                    cur.done = "Начислено: " + this.dateRange(l1, r1);
                }
                if(item.type == "delete" && l2 <= r2)
                {
                    cur.done = "Отменено: " + this.dateRange(l2, r2);
                }

                if(item.active)
                {
                    cur.doing = {done: item.done, total: item.total};

                    cur.doing.text = (item.type == "add" ? "Начисляется: " : "Отменяется: ") + this.dateForClient(item.date, "month");
                }

                if(item.type == "add" && l2 <= r2)
                {
                    cur.todo = "Осталось начислить: " + this.dateRange(l2, r2);
                }
                if(item.type == "delete" && l1 <= r1)
                {
                    cur.todo = "Осталось отменить: " + this.dateRange(l1, r1);
                }

                if(item.error) cur.error = item.error;

                if(item.error || item.date < item.ldate || item.date > item.rdate) cur.delete = item;

                res.push(cur);
            });
            
            return res;
        }
    },
    methods:
    {
        ...mapActions(["ADD_CALCULATION_PROCESS", "REMOVE_CALCULATION_PROCESS"]),

        dateFormatter: function(date)
        {
            return this.dateForClient(date, "month");
        },
        ldateChanged: function(date)
        {
            if(this.rdate < date) this.rdate = date;
        },
        rdateChanged: function(date)
        {
            if(this.ldate > date) this.ldate = date;
        },
        addCalculation: function(operation)
        {
            let ldate = new Date(this.ldate.getFullYear(), this.ldate.getMonth());

            let rdate = new Date(this.rdate.getFullYear(), this.rdate.getMonth());

            this.ADD_CALCULATION_PROCESS({type: operation, FirmID: this.FirmID, ObjectID: this.ObjectID, ldate: ldate, rdate: rdate});
        },
        removeCalculation: function(process)
        {
            this.REMOVE_CALCULATION_PROCESS({FirmID: this.FirmID, ObjectID: this.ObjectID, process: process});
        },
        dateRange(left, right)
        {
            left = this.dateForClient(left, "month");

            right = this.dateForClient(right, "month");

            if(left == right) return left;
            else return left + " - " + right;
        }
    }
}
</script>

<style>
    
</style>
