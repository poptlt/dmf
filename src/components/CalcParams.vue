<template>
    <!--<div>{{info}}</div>-->
    <div style="min-width: 600px">
    <vue-good-table :columns="columns" :rows="rows"/>
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

import 'vue-good-table/dist/vue-good-table.css'
import { VueGoodTable } from 'vue-good-table';

export default {
    components:
    {
        VueGoodTable
    },
    props: ["FirmID", "ObjectID"],
    data: function()
    {
        return {

            columns:
            [
                {label: "Дата", field: "Date"},
                {label: "Параметр", field: "CalcParam"},
                {label: "Значение", field: "Value"},
                {label: "Объект", field: "ObjectName"},
            ],

        }
    },
    computed:
    {
        ...mapState(["Objects"]),
        rows: function()
        {
            let data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'CalcParamsInfo']);

            if(data === undefined) this.reload();

            data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'CalcParamsInfo']);

            if(data) return data;
            else return [];
        }
    },
    methods:
    {
        ...mapActions(["LOAD_CHILDREN_HISTORY_CALC_PARAMS"]),
        reload: function()
        {
            this.LOAD_CHILDREN_HISTORY_CALC_PARAMS({FirmID: this.FirmID, ObjectID: this.ObjectID});
        }
    }
}

</script>

<style>

</style>
