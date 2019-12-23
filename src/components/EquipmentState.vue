<template>
<State ref="state">
<table class="table">
    <template v-for="(kit, i) in kits">
    <tr :style="{'background-color': (kit.Value) ? ((kit.State ? '#ccffcc' : '#ffcccc')) : 'WhiteSmoke'}">
        <td>{{ (kit.Value) ? kit.Value.Name : kit.ComplectName }}</td>
        <td>
            <button v-if="editable"
                    @click="changeTariff1()"
                    class="btn btn-sm"
                    :style="{'font-size': '16px'}">
                {{ kit.TariffValue ? kit.TariffValue : '-' }}
            </button>
            <div v-else>{{ kit.TariffValue ? kit.TariffValue : '-' }}</div>
        </td>
        <td class="text-right">
            <button v-if="kit.Value && editable"
                    @click="changeState(kit.ComplectID, !kit.State, kit.Value.Name)"
                    class="btn btn-sm">
                <font-awesome-icon :icon="kit.State ? 'toggle-on' : 'toggle-off'" size="lg"/>
            </button>

            <button @click="showInfo(i)"
                    class="btn btn-link btn-sm">
                <font-awesome-icon :icon="info[i] ? 'chevron-up' : 'chevron-down'"/>
            </button>
        </td>
    </tr>
    <tr v-show="info[i]">
        <td colspan="3" class="p-0">
            <div v-if="kit.ValueData" class="p-2">

                <font-awesome-icon v-if="kit.ValueData.Object.ObjectID == ObjectID"
                                   @click="remove('equipment', kit.ValueData.Date, kit.ComplectID)"
                                   icon="times"
                                   size="lg"
                                   class="mx-2 text-danger"
                                   style="cursor: pointer"/>

                {{ dateForClient(kit.ValueData.Date, 'day') }}
                {{ kit.Value ? 'установлено' : 'демонтаж' }}
                <span v-if="kit.ValueData.Object.ObjectID != ObjectID">
                    на
                    <a href="#"
                       @click="showObject(kit.ValueData.Object)">
                        {{ kit.ValueData.Object.Name }}
                    </a>
                </span>
            </div>
            <div v-if="kit.StateData" class="p-2">

                <font-awesome-icon v-if="kit.StateData.Object.ObjectID == ObjectID"
                                   @click="remove('state', kit.StateData.Date, kit.ComplectID)"
                                   icon="times"
                                   size="lg"
                                   class="mx-2 text-danger"
                                   style="cursor: pointer"/>

                {{ kit.State ? 'Включено' : 'Выключено' }}
                {{ dateForClient(kit.StateData.Date, 'day') }}
                <span v-if="kit.StateData.Object.ObjectID != ObjectID">
                    на
                    <a href="#"
                       @click="showObject(kit.StateData.Object)">
                        {{ kit.StateData.Object.Name }}
                    </a>
                </span>
            </div>
            <div v-for="(tariff, ID) in kit.TariffData" class="p-2">

                <font-awesome-icon v-if="tariff.Object.ObjectID == ObjectID && tariff.Set"
                                   @click="remove('tariff', tariff.Date, ID)"
                                   icon="times"
                                   size="lg"
                                   class="mx-2 text-danger"
                                   style="cursor: pointer"/>

                {{ dateForClient(tariff.Date, 'day') }}
                {{ tariff.Set ? 'установлен тариф' : 'изменено значение тарифа' }}
                <a href="#"
                   @click="showTariff(tariff.Tariff)">
                    {{ tariff.Tariff.Name }}
                </a>
                <span v-if="tariff.Object.ObjectID != ObjectID">
                {{ tariff.Set ? 'на' : 'установленного на' }}
                    <a href="#"
                       @click="showObject(tariff.Object)">
                        {{ tariff.Object.Name }}
                    </a>
                </span>
            </div>
            <table v-if="editable" class="table">
                <tr v-for="equipment in kit.Types">
                    <td>{{equipment.Name}}</td>
                    <td>
                        <button v-if="kit.Value && kit.Value.ID == equipment.ID"
                                @click="changeEquipment(kit.ComplectID, '-', equipment.Name)"
                                class="btn btn-sm btn-danger">
                            Демонтаж
                        </button>
                        <button v-else
                                @click="changeEquipment(kit.ComplectID, equipment.ID, equipment.Name)"
                                class="btn btn-sm btn-success">
                            Установка
                        </button>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    </template>
</table>


<v-dialog data-app
          v-model="dialog"
          content-class="bg-white p-2 m-1"
          max-width="350px">
    <div class="d-flex pb-2">
        <div class="text-center">{{ dialogTitle }}</div>
        <button @click="dialog=false"
                class="btn btn-sm btn-danger flex-grow-0">
            <font-awesome-icon icon="times"/>
        </button>
    </div>
    <div v-if="dialogType == 'tariff1'">
        <div v-for="tariff in tariffs"
             @click="changeTariff2(tariff.TariffID, tariff.TariffName)"
             class="border-top p-2">
            {{ tariff.TariffName }}
        </div>
    </div>
    <div v-else class="d-flex justify-content-center">
        <Datepicker inline
                    @selected="add"
                    :monday-first="true"
                    :language="ru"
                    :minimum-view="dialogType == 'tariff2' ? 'month' : 'day'"
                    :bootstrap-styling="true"
                    class="flex-grow-0"/>
    </div>
</v-dialog>

</State>
</template>

<script>

import Vue from 'vue';

import Datepicker from 'vuejs-datepicker';

import {ru} from 'vuejs-datepicker/dist/locale';

import { mapActions } from 'vuex';

import State from './State.vue';

export default {
    props: ["FirmID", "ObjectID", "data", "tariffs", "date", "editable"],
    inject: ["addPanel", "showObject"],
    components:
    {
        Datepicker, State
    },
    data ()
    {
        //console.log(this.data);

        let data = {
            ru: ru,
            kits: [],
            info: [],

            dialog: false,
            dialogType: undefined,
            dialogTitle: undefined,

            kitID: undefined,
            equipmentID: undefined,
            state: undefined,
            tariffID: undefined
        };

        this.data.forEach((item) => {

            let cur = {};

            for(let key in item) cur[key] = item[key];

            if(this.date)
            {
                if(cur.ValueData && cur.ValueData.Date != this.date)
                {
                    delete cur.ValueData;
                }
                if(cur.StateData && cur.StateData.Date != this.date)
                {
                    delete cur.StateData;
                }
            }


            cur.TariffData = {};

            item.Types.forEach((equipment) => {

                if(equipment.Tariff)
                {
                    if(this.date)
                    {
                        if(equipment.Tariff.Date == this.date)
                        {
                            cur.TariffData[equipment.Tariff.Tariff.ID] = equipment.Tariff;
                        }
                    }
                    else
                    {
                        if(item.Value && equipment.ID == item.Value.ID)
                        {
                            cur.TariffData[equipment.Tariff.Tariff.ID] = equipment.Tariff;
                        }
                    }

                    if(item.Value && equipment.ID == item.Value.ID)
                    {
                        cur.TariffValue = equipment.Tariff.Value;
                    }
                }

            });

            data.kits.push(cur);
        });

        //console.log(data.kits);

        return data;
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        showInfo(i)
        {
            Vue.set(this.info, i, this.info[i] ? false : true);
        },
        showTariff({ID, Name})
        {
            this.addPanel("TariffsTOHistory", Name, {FirmID: this.FirmID, TariffID: ID});
        },
        changeState(kitID, state, equipmentName)
        {
            this.kitID = kitID;
            this.state = state;

            this.dialog = true;
            this.dialogType = "state";
            this.dialogTitle = (state ? "Включение " : "Выключение ") + equipmentName;
        },
        changeEquipment(kitID, equipmentID, equipmentName)
        {
            this.kitID = kitID;
            this.equipmentID = equipmentID;

            this.dialog = true;
            this.dialogType = "equipment"
            this.dialogTitle = (equipmentID == "-" ? "Демонтаж " : "Установка ") + equipmentName;
        },
        changeTariff1()
        {
            this.dialog = true;
            this.dialogType = "tariff1";
            this.dialogTitle = "Выберите тариф";
        },
        changeTariff2(tariffID, tariffName)
        {
            this.tariffID = tariffID;

            this.dialogType = "tariff2";
            this.dialogTitle = "Установка тарифа " + tariffName;
        },
        add(date)
        {
            let change = this.$refs.state.change;

            function accepted()
            {
                change("show");
            }

            function rejected(message)
            {
                change("error", message);
            }

            let query;

            if(this.dialogType == "state")
            {
                change("changing", (this.state ? "Включение" : "Выключение") + " оборудования");

                query = {
                    func: "ObjectHardWorkWrite",
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    date: this.dateForServer(date, "day"),
                    kitID: this.kitID,
                    state: this.state
                };
            }
            if(this.dialogType == "equipment")
            {
                change("changing", (this.equipmentID != "-" ? "Установка" : "Демонтаж") + " оборудования");

                query = {
                    func: "ObjectHardWrite",
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    date: this.dateForServer(date, "day"),
                    kitID: this.kitID,
                    equipmentID: this.equipmentID
                }
            }
            if(this.dialogType == "tariff2")
            {
                change("changing", "Установка тарифа");

                query = {
                    func: "ObjectTariffTOWrite",
                    FirmID: this.FirmID,
                    ObjectID: this.ObjectID,
                    date: this.dateForServer(date, "month"),
                    value: this.tariffID
                };
            }

            this.SEND_DATA({
                query: query,
                accepted: accepted,
                rejected: rejected
            });

            this.dialog = false;
        },
        remove(type, date, val)
        {
            let ok = confirm("Вы уверены, что хотите удалить запись?");

            if(!ok) return;

            let change = this.$refs.state.change;

            function accepted()
            {
                change("show");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при удалении записи: " + message);
            }

            change("changing", "Удаление записи");

            let query = {
                FirmID: this.FirmID,
                ObjectID: this.ObjectID,
                date: date
            };

            if(type == "tariff")
            {
                query.func = "ObjectTariffTODelete";
                query.value = val;
            }
            else
            {
                query.func = (type == "equipment") ? "ObjectHardDelete" : "ObjectHardWorkDelete";
                query.kitID = val;
            }

            this.SEND_DATA({
                query: query,
                accepted: accepted,
                rejected: rejected
            });
        }
    }
}
</script>
