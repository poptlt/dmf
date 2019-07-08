<template>
    <div v-if="PropsItems !== undefined && CalcParamsItems !== undefined">
        <div v-if="PropsItems !== null && CalcParamsItems !== null">
            <v-expansion-panel expand>
                <v-expansion-panel-content>
                    <template v-slot:header>
                      <div>Реквизиты</div>
                    </template>
                    <v-data-table :headers="PropsHeaders" :items="PropsItems" hide-actions disable-initial-sort>
                        <template v-slot:items="props">
                        <tr>
                            <td class="text-xs-right">{{ props.item.PropName }}</td>
                            <td class="text-xs-right">{{ props.item.Value }}</td>
                        </tr>
                        </template>
                    </v-data-table>
                </v-expansion-panel-content>
                <v-expansion-panel-content>
                    <template v-slot:header>
                      <div>Параметры расчетов</div>
                    </template>
                    <v-data-table :headers="CalcParamsHeaders" :items="CalcParamsItems" hide-actions disable-initial-sort>
                        <template v-slot:items="props">
                        <tr>
                            <td class="text-xs-right">{{ props.item.ParamName }}</td>
                            <td class="text-xs-right">{{ props.item.Value }}</td>
                        </tr>
                        </template>
                    </v-data-table>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </div>
        <div v-else>loading</div>
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["info"],
    data: function()
    {
        return {

            PropsHeaders:
            [
                {text: "Имя", value: "PropName"},
                {text: "Значение", value: "Value"},
            ],
            CalcParamsHeaders:
            [
                {text: "Имя", value: "ParamName"},
                {text: "Значение", value: "Value"},
            ]
        }
    },
    computed:
    {
        ...mapState(["Objects"]),
        root: function()
        {
            let FirmID = this.info.FirmID, ObjectID = this.info.ObjectID;

            return this.Objects[FirmID][ObjectID];
        },
        PropsItems: function()
        {
            if(this.root.Props === undefined)
            {
                this.LOAD_OBJECT({FirmID: this.info.FirmID, ObjectID: this.info.ObjectID});
            }
            return this.root.Props;
        },
        CalcParamsItems: function()
        {
            if(this.root.CalcParams === undefined)
            {
                this.LOAD_OBJECT({FirmID: this.info.FirmID, ObjectID: this.info.ObjectID});
            }
            return this.root.CalcParams;
        }
    },
    methods:
    {
        ...mapActions(['LOAD_OBJECT']),
    }
}
</script>

<style>

</style>
