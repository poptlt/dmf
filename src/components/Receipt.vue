<template>
    <div class="d-flex p-2">
        <Datepicker v-model="date" :language="ru" :format="dateFormatter" minimum-view="month" :bootstrap-styling="true"/>
        
        <button @click="make" class="btn btn-primary ml-2">Сформировать квитанции</button>
    </div>
</template>

<script>
    
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
        }
    },
    methods:
    {
        make: function()
        {
            window.open("http://dev.dmf.su/receipt/type1?ObjectID=" + this.ObjectID + "&FirmID=" + this.FirmID + "&Date=" + this.dateForServer(this.date, "month"));
        },
        dateFormatter: function(date)
        {
            return this.dateForClient(date, "month");
        }
    }
}
</script>

<style>
    
</style>