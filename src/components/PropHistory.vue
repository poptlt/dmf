<template>
    <div v-if="isNotEmpty">
        
        <center v-if="History === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="History.DMF_ERROR" class="alert alert-danger">{{ History.message }}</div>
        
        <table v-else class="table table-hover">
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
            </tbody>
        </table>
        
        
        
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

import Datepicker from 'vuejs-datepicker';
    
import {ru} from 'vuejs-datepicker/dist/locale'

export default {
    props: ["FirmID", "ObjectID", "PropID"],
    components:
    {
        Datepicker
    },
    data: function()
    {
        return {
            
            ru: ru,
            propValue: '',
            propDate: new Date()
        }
    },
    computed:
    {
        ...mapState(["Objects"]),

        isNotEmpty: function()
        {            
            let data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'Props', this.PropID, 'History']);

            if (data === undefined)
            {
                this.reload();
                
                let data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'Props', this.PropID, 'History']);
                
                if (data === undefined) return false;
                else return true;
            }
            else return true;           
        },
        History: function()
        {
            return this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'Props', this.PropID, 'History']);
        }
    },
    methods:
    {
        ...mapActions(['LOAD_PROP_HISTORY', 'WRITE_PROP']),
        reload: function()
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
        }
    }
}
</script>

<style>
    
</style>