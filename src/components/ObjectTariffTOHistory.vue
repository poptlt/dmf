<template>
<div>    
    <TariffTOState :data="history"
                   :FirmID="FirmID"
                   :ObjectID="ObjectID"
                   :addPanel="addPanel"
                   :showObject="showObject"
                   :remove="remove"/>
    
    <div v-if="tariffs.length" class="d-flex align-items-center p-1">

        <button @click="add" class="btn btn-success btn-sm mr-1 flex-grow-0">
            <font-awesome-icon icon="plus"/>
        </button>

        <Datepicker v-model="newDate" :monday-first="true" :language="ru" :format="dateFormatter" minimum-view="month" :bootstrap-styling="true" style="width: 140px" class="flex-shrink-0"/>

        <select v-model="newTariff" class="form-control ml-1">
            <option v-for="tariff in tariffs" :value="tariff.TariffID">
                {{ tariff.TariffName }}
            </option>
        </select>

    </div>

</div>
</template>

<script>

import { mapActions } from 'vuex';

import TariffTOState from './ObjectContent/TariffTOState.vue';

import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';

export default {
    props: ["FirmID", "ObjectID", "history", "tariffs", "addPanel", "showObject"],
    components:
    {
        TariffTOState, Datepicker
    },
    data: function()
    {
        return {

            ru: ru,
            newTariff: this.tariffs[0].TariffID,
            newDate: new Date()
        }
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        dateFormatter: function(date)
        {
            return this.dateForClient(date, "month");
        },
        add: function()
        {
            let change = this.$parent.change;

            function accepted()
            {
                change("done", "Тариф добавлен");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при добавлении тарифа: " + message);
            }

            change("changing", "Добавление тарифа");
            
            this.SEND_DATA({
                query: {
                    func: "ObjectTariffTOWrite",
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    date: this.dateForServer(this.newDate, "month"),
                    value: this.newTariff
                },
                accepted: accepted,
                rejected: rejected
            });
        },
        remove: function(date, ID)
        {
            let change = this.$parent.change;

            function accepted()
            {
                change("done", "Тариф удалён");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при удалении тарифа: " + message);
            }

            change("changing", "Удаление тарифа");
            
            this.SEND_DATA({
                query: {
                    func: "ObjectTariffTODelete",
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    date: date,
                    value: ID
                },
                accepted: accepted,
                rejected: rejected
            });
        }
    }
}
</script>

<style>

</style>
