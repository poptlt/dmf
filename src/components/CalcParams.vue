<template>

    <!--<div>{{info}}</div>-->

    <div v-if="rows !== undefined">

        <center v-if="rows === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="rows.DMF_ERROR" class="alert alert-danger">{{ rows.message }}</div>

        <div v-else style="min-width: 600px">

            <center v-if="!rows.length" class="m-2">Не найдено записей</center>

            <template v-else>

                <template v-for="col in columns">
                    <div class="m-2" v-if="col.hidden">
                        <span class="font-weight-bold">{{ col.label }}: </span>
                        <template v-if="col.field == 'ObjectName'">
                            <a href="#"
                               @click="showObject(rows[0].ObjectID, rows[0].ObjectName, rows[0].ObjectType)">
                                {{ rows[0].ObjectName }}
                            </a>
                        </template>
                        <template v-else>{{ rows[0][col.field] }}</template>
                    </div>
                </template>

                <vue-good-table :columns="columns" :rows="rows">

                    <template slot="table-row" slot-scope="props">

                        <a v-if="props.column.field == 'ObjectName'" href="#"
                           @click="showObject(props.row.ObjectID, props.row.ObjectName, props.row.ObjectType)">
                            {{ props.row.ObjectName }}
                        </a>

                        <span v-else>{{ props.row[props.column.field] }}</span>

                    </template>

                    <center slot="emptystate">
                        Не найдено записей
                    </center>

                </vue-good-table>

            </template>
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
    props: ["FirmID", "ObjectID", "addPanel"],
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

                row.ObjectType = item.ObjectType;

                row.value = item.Value;

                row.param = item.CalcParam;

                res.push(row)
            });

            return res;
        },
        columns: function()
        {
            let res = [

                {label: "Дата", field: "date", sortFn: this.sort},
                {label: "Объект", field: "ObjectName", sortFn: this.sort},
                {label: "Параметр", field: "param"},
                {label: "Значение", field: "value"},
            ];

            res.forEach((col) =>
            {
                let set = {}

                this.rows.forEach((row) =>
                {
                    set[row[col.field]] = 1;
                });

                let cnt=0;


                col.filterOptions = {

                    enabled: (col.field != "ObjectName") ? true : false,
                    placeholder: 'все',
                    filterDropdownItems: [],
                    filterFn: (data, str) => data == str
                };

                for(let key in set)
                {
                    col.filterOptions.filterDropdownItems.push(key);
                }

                if(col.filterOptions.filterDropdownItems.length == 1)
                {
                    col.hidden = true;
                }
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
        },
        showObject(ObjectID, Name, ObjectType)
        {
            this.addPanel("Object", Name, {FirmID: this.FirmID, ObjectID: ObjectID, ObjectType: ObjectType});
        }
    }
}

</script>

<style>

</style>
