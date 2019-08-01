<template>
    <div v-if="created">
        
        <div class="d-flex">
            <Datepicker v-if="state != 'loading'" v-model="date" @selected="dateChanged" :monday-first="true" :language="ru" :format="dateFormatter" minimum-view="month" :bootstrap-styling="true" class="m-1"/>
            
            <button v-if="state == 'loaded'" @click="addCalculation('add')" class="btn btn-primary btn-sm m-1">Начислить</button>
            
            <button v-if="state == 'loaded'"  @click="addCalculation('delete')" class="btn btn-primary btn-sm m-1">Отменить</button>
        </div>
        
        <center v-if="state == 'loading'" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
        
        <div v-else-if="state == 'loaded'" class="p-3">{{ info }}</div>
        
        <div v-else class="alert alert-danger">{{ info }}</div>
        
        <div v-if="calculations">
            <center><h5>Процессы</h5></center>
            
            <div v-for="(process, ID) in calculations" class="d-flex align-items-start border-top p-2">
                
                    <button v-if="!process.Active" @click="removeCalculation(ID)" class="flex-grow-0 btn btn-danger btn-sm">
                        <font-awesome-icon icon="times"/>
                    </button>
                
                    <div class="ml-2">
                        <div class="d-flex justify-content-between mb-2">
                            <div>{{ process.Date }}</div>
                            <div class="text-right">{{ process.Type }}</div>
                        </div>
                        <div class="progress bg-secondary">
                            <div class="progress-bar" :class="{'bg-success': (!process.Active && !process.Error), 'bg-danger': (!process.Active && process.Error)}" :style="{width: (process.Done / process.Total * 100) + '%'}">{{ process.Done }} / {{ process.Total }}</div>
                        </div>
                        <div v-if="process.Error" class="alert alert-danger mb-0">{{ process.Error }}</div>
                    </div>
                    
            </div>
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
            date: new Date(),
            state: "loaded",
            info: undefined,
        }
    },
    computed:
    {
        ...mapState(["Background"]),
        created: function()
        {
            this.dateChanged(new Date());
            
            return true;
        },
        calculations: function()
        {            
            let data = this.dataState(this.Background, [this.FirmID, this.ObjectID]);
            
            if(!data) return null;
            
            let res = {};
            
            for(let processID in data)
            {
                if(data[processID]) res[processID] = data[processID];
            }
            
            if(Object.keys(res).length) return res;
            else return null;
        }
    },
    methods:
    {
        ...mapActions(["LOAD_CALCULATION_STATE", "WRITE_CALCULATION", "REMOVE_CALCULATION"]),

        dateFormatter: function(date)
        {
            return this.dateForClient(date, "month");
        },
        dateChanged: function(date)
        {
            let th = this;
            
            this.state = "loading";
            date = this.dateForServer(date, "month");
            
            function accepted(info)
            {
                th.state = "loaded", th.info = info;
            }
            
            function rejected(message)
            {
                th.state = "error", th.info = message;
            }
                        
            this.LOAD_CALCULATION_STATE({FirmID: this.FirmID, ObjectID: this.ObjectID, date: date, accepted: accepted, rejected: rejected});
        },
        addCalculation: function(operation)
        {
            this.WRITE_CALCULATION({operation: operation, ObjectID: this.ObjectID, FirmID: this.FirmID, dateClient: this.dateForClient(this.date, "month"), dateServer: this.dateForServer(this.date, "month")});
        },
        removeCalculation: function(ID)
        {
            this.REMOVE_CALCULATION({FirmID: this.FirmID, ObjectID: this.ObjectID, ProcessID: ID});
        }
    }
}
</script>

<style>
    
</style>