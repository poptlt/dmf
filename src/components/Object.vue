<template>
    <div>
        <b-card no-body>
            <b-card-header @click="collapse(propsID)">Реквизиты</b-card-header>
            <b-collapse :id="propsID" visible :accordion="accordionID">
                <b-card-body class="p-0">
                    <table v-if="PropsItems" class="table table-hover">
                        <tbody>
                            <tr v-for="item in PropsItems">
                                <td>{{ item.PropName }}</td>
                                <td>{{ item.Value }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <center v-else class="text-primary"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card no-body>
            <b-card-header @click="collapse(calcParamsID)">Параметры расчетов</b-card-header>
            <b-collapse :id="calcParamsID" visible :accordion="accordionID">
                <b-card-body class="p-0">
                    <table v-if="CalcParamsItems" class="table table-hover">
                        <tbody>
                            <tr v-for="item in CalcParamsItems">
                                <td>{{ item.ParamName }}</td>
                                <td>{{ item.Value }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <center v-else class="text-primary"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
                </b-card-body>
            </b-collapse>
        </b-card>
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["info"],
    data: function()
    {
        return {
            accordionID: this.randomID(),
            propsID: this.randomID(),
            calcParamsID: this.randomID()
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
        randomID: function()
        {
            return "id"+(""+Math.random()).substring(2);
        },
        collapse: function(ID)
        {
            this.$root.$emit('bv::toggle::collapse', ID);
        }
    }
}
</script>

<style>

</style>
