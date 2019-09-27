<template>
<State ref="state">
    <template v-if="isData(vuexLoad(queries))">

        <TariffTOState :data="vuexLoad(queries).history" :remove="remove"/>

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

    </template>
    <NoData v-else :data="vuexLoad(queries)"/>
</State>
</template>

<script>

import { mapActions } from 'vuex';

import State from './State.vue';

import NoData from './NoData.vue';

import TariffTOState from './ObjectContent/TariffTOState.vue';

import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';

export default {
    props: ["FirmID", "ObjectID"],
    components:
    {
        State, NoData, TariffTOState, Datepicker
    },
    data: function()
    {
        return {

            ru: ru,
            queries:
            {
                history: {func: "ObjectTariffTODetails", FirmID: this.FirmID, ObjectID: this.ObjectID},

                tariffs: {func: "GetTariffsTO", FirmID: this.FirmID}
            },
            newTariff: undefined,
            newDate: new Date()
        }
    },
    computed:
    {
        tariffs: function()
        {
            console.log("here");

            let res = this.vuexLoad(this.queries).tariffs;

            if(res.length)
            {
                this.newTariff = res[0].TariffID;

                this.newDate = new Date();
            }

            return res;
        }
    },
    methods:
    {
        ...mapActions(["WRITE_HISTORY"]),
        dateFormatter: function(date)
        {
            return this.dateForClient(date, "month");
        },
        reload: function()
        {
            this.vuexClear(this.queries);
        },
        add: function()
        {
            let state = this.$refs.state;

            function accepted()
            {
                state.change("done", "Тариф добавлен");
            }

            function rejected(message)
            {
                state.change("error", "Произошла ошибка при добавлении тарифа: " + message);
            }

            state.change("changing", "Добавление тарифа");

            this.WRITE_HISTORY({operation: "add",
                                FirmID: this.FirmID,
                                ObjectID: this.ObjectID,
                                AttrType: "ObjectTariffTO",
                                date: this.dateForServer(this.newDate, "month"),
                                value: this.newTariff,
                                query: this.queries.history,
                                accepted: accepted,
                                rejected: rejected});
        },
        remove: function(date, ID)
        {
            let state = this.$refs.state;

            function accepted()
            {
                state.change("done", "Тариф удалён");
            }

            function rejected(message)
            {
                state.change("error", "Произошла ошибка при удалении тарифа: " + message);
            }

            state.change("changing", "Удаление тарифа");

            this.WRITE_HISTORY({operation: "delete",
                                FirmID: this.FirmID,
                                ObjectID: this.ObjectID,
                                AttrType: "ObjectTariffTO",
                                date: date,
                                value: ID,
                                query: this.queries.history,
                                accepted: accepted,
                                rejected: rejected});
        }
    }
}
</script>

<style>

</style>
