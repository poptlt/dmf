<template>

<State ref="state">
    <Data :data="[history, tariffs]">

        <div>{{history}}</div>

        <div class="d-flex align-items-center px-1 py-2">

            <button @click="add" class="btn btn-success btn-sm mr-1">
                <font-awesome-icon icon="plus"/>
            </button>

            <Datepicker v-model="newDate" :monday-first="true" :language="ru" :format="dateFormatter" minimum-view="month" :bootstrap-styling="true" style="width: 140px" class="flex-shrink-0"/>

            <select class="form-control ml-1" v-model="newValue">
                <option v-for="tariff in tariffs" :value="tariff.TariffID">
                    {{ tariff.TariffName }}
                </option>
            </select>

        </div>

    </Data>
</State>

</template>

<script>

import State from '../State.vue';

import Data from '../Data.vue';

import { mapActions } from 'vuex';

import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';

export default {
    props: ["FirmID", "ObjectID", "history", "tariffs"],
    components:
    {
        State, Data, Datepicker
    },
    data: function()
    {
        return {

            ru: ru,
            newDate: new Date(),
            newValue: this.tariffs[0].TariffID;
        }
    },
    methods:
    {
        ...mapActions(['WRITE_HISTORY']),
        dateFormatter: function(date)
        {
            return this.dateForClient(date, "month");
        },
        add: function()
        {
            let state = this.$refs.state;

            function accepted()
            {
                state.change("done", "Запись добавлена");
            }

            function rejected(message)
            {
                state.change("error", "Произошла ошибка при добавлении записи: " + message);
            }

            state.change("changing", "Добавление записи");

            let date = this.dateForServer(this.newDate, "month");

            this.WRITE_HISTORY({operation: "add",
                               FirmID: this.FirmID,
                               ObjectID: this.ObjectID,
                               AttrType: "ObjectTariffTO",
                               date: date,
                               value: this.newValue,
                               accepted: accepted,
                               rejected: rejected,
                               query: {func: "ObjectTariffTODetails",
                                       FirmID: this.FirmID,
                                       ObjectID: this.ObjectID}
                               });
        },
        Delete: function(date, value)
        {
            if(!confirm("Вы уверены, что хотите удалить запись?")) return;

            let state = this.$refs.state;

            function accepted()
            {
                state.change("done", "Запись удалена");
            }

            function rejected(message)
            {
                state.change("error", "Произошла ошибка при удалении записи: " + message);
            }

            this.state = "changing", this.message = "Удаление записи...";

            this.WRITE_HISTORY({operation: "delete",
                               FirmID: this.FirmID,
                               ObjectID: this.ObjectID,
                               AttrType: "ObjectTariffTO",
                               date: date,
                               value: value,
                               accepted: accepted,
                               rejected: rejected,
                               query: {func: "ObjectTariffTODetails",
                                       FirmID: this.FirmID,
                                       ObjectID: this.ObjectID}
                               });
        },
    }
}
</script>
