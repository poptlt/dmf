<template>
<div>
    <!--<table class="table">
        <template v-for="(tariff, i) in data">
            <tr>
                <td>{{ dateForClient(new Date(Date.parse(tariff.Date)), 'month') }}</td>
                <td>{{ tariff.TariffName }} 
                    <a v-if="tariff.ObjectID != ObjectID"
                       href="#"
                       @click="showObject(tariff.ObjectID, tariff.ObjectName)">
                        ( {{ tariff.ObjectName }} )
                    </a>
                </td>
                <td v-if="remove" class="p-1" align="right">
                    <button @click="remove(tariff.Date, tariff.TariffID)"
                            class="btn btn-danger btn-sm">
                        <font-awesome-icon icon="times"/>
                    </button>
                </td>
            </tr>
            <tr>
                <td :colspan="(remove) ? 3 : 2" class="p-0 pl-4">
                    <table class="table table-bordered m-0">
                        <tr v-for="equipment in tariff.Value">
                            <td>{{ equipment.TypeName }}</td>
                            <td>{{ equipment.Value }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </template>
    </table>-->

    <table class="table">
        <template v-for="(tariff, i) in data">
            
            <tr v-for="(equipment, j) in tariff.Value">
                <td>{{ equipment.TypeName }}</td>
                <td>{{ equipment.Value }}</td>
                <td v-if="j==0" :rowspan="tariff.Value.length" class="pr-2 pl-0 text-right">
                    <button @click="show(i)"
                            class="btn btn-link btn-sm">
                        <font-awesome-icon :icon="(opened[i]) ? 'chevron-up' : 'chevron-down'"/>
                    </button>
                    <button v-if="remove"
                            @click="remove(tariff.Date, tariff.Tariff.TariffID)"
                            class="btn btn-danger btn-sm">
                        <font-awesome-icon icon="times"/>
                    </button>
                </td>
            </tr>
            <tr v-show="opened[i]">
                <td colspan="3">
                    {{ dateForClient(new Date(Date.parse(tariff.Date)), 'month') }}, 
                    
                    <a href="#" @click="showTariff(tariff.Tariff.TariffID, tariff.Tariff.TariffName, tariff.Tariff.Object.Name)">
                        {{ tariff.Tariff.TariffName }}
                    </a> 
                    
                    <a v-if="tariff.Object.ObjectID != ObjectID"
                       href="#"
                       @click="showObject(tariff.Object)">
                        ( {{ tariff.Object.Name }} )
                    </a>
                </td>
            </tr>

        </template>
    </table>

</div>
</template>

<script>

import Vue from 'vue';
    
export default {
    props: ["data", "remove", "FirmID", "ObjectID", "addPanel", "showObject"],
    data: function()
    {
        //console.log(this.data);
        return {
            opened: []
        }
    },
    methods:
    {
        show: function(i)
        {
            Vue.set(this.opened, i, (this.opened[i]) ? false : true);
        },
        showTariff: function(ID, tariffName, firmName)
        {
            this.addPanel("TariffsTOHistory", firmName + " " + tariffName, {FirmID: this.FirmID, TariffID: ID});
        }
    }
}
</script>

<style>

</style>
