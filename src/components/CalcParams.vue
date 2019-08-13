<template>

    <!--<div>{{info}}</div>-->

    <div v-if="rows !== undefined">

        <center v-if="rows === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="rows.DMF_ERROR" class="alert alert-danger">{{ rows.message }}</div>

        <div v-else style="min-width: 600px">
            <vue-good-table :columns="columns" :rows="rows"/>
        </div>

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
                {label: "Дата", field: "date", sortFn: this.sort},
                {label: "Параметр", field: "param"},
                {label: "Значение", field: "value",

                },
                {label: "Объект", field: "ObjectName", sortFn: this.sort},
            ],
        }
    },
    computed:
    {
        ...mapState(["Objects"]),
        info: function()
        {
            let data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'CalcParamsInfo']);

            if(data === undefined) this.reload();

            return this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'CalcParamsInfo']);
        },
        rows: function()
        {
            let data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'CalcParamsInfo']);

            if(data === undefined) this.reload();

            data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'CalcParamsInfo']);

            if(!data || data.DMF_ERROR) return data;

            let res = [];

            data.forEach((item) =>
            {
                let row = {};

                row.dateSort = new Date(Date.parse(item.Date));

                row.date = this.dateForClient(row.dateSort, "month");

                row.ObjectID = item.ObjectID;

                row.ObjectName = item.ObjectName;

                row.ObjSort = this.objCode(row.ObjectName);

                row.value = item.Value;

                row.param = item.CalcParam;

                res.push(row)
            });

            return res;
        }
    },
    methods:
    {
        ...mapActions(["LOAD_CHILDREN_HISTORY_CALC_PARAMS"]),
        reload: function()
        {
            this.LOAD_CHILDREN_HISTORY_CALC_PARAMS({FirmID: this.FirmID, ObjectID: this.ObjectID});
        },
        sort(x, y, col, rowX, rowY)
        {
            if(col.field == "date")
            {
                return (rowX.dateSort < rowY.dateSort ? -1 : (rowX.dateSort > rowY.dateSort ? 1 : 0));
            }
            if(col.field == "ObjectName")
            {
                return (rowX.ObjSort < rowY.ObjSort ? -1 : (rowX.ObjSort > rowY.ObjSort ? 1 : 0));
            }
        },
        objCode(str)
        {
            function check(sy)
            {
                return (sy >= '0' && sy <= '9');
            }

            let pt=0, res="";
            while(pt < str.length)
            {
                if(check(str[pt]))
                {
                    let cur = "";
                    while(pt < str.length && check(str[pt])) cur+=str[pt++];

                    for(let i=0; i<15-cur.length; i++) res+='0';

                    res+=cur;
                }
                else pt++;
            }

            return res;
        }
    }
}

</script>

<style>

</style>
