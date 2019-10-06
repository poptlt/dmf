<template>
<div>
    <div v-for="tariff in tariffs">

        <div v-if="tariff.ID == changeID" class="d-flex align-items-center p-2">

            <button @click="changeID = undefined" class="btn btn-primary btn-sm">
                <font-awesome-icon icon="chevron-left"/>
            </button>

            <button @click="add(tariff.ID, changeName)" class="btn btn-success btn-sm ml-1">
                <font-awesome-icon icon="check"/>
            </button>

            <input v-model="changeName" type="text" class="form-control ml-1"/>
        </div>

        <div v-else class="d-flex align-items-center p-2">

            <button @click="Delete(tariff.ID)" class="btn btn-danger btn-sm flex-grow-0">
                <font-awesome-icon icon="times"/>
            </button>

            <button @click="changeID = tariff.ID; changeName = tariff.name" class="btn btn-primary btn-sm ml-1 flex-grow-0">
                <font-awesome-icon icon="edit"/>
            </button>

            <div  @click="showHistory(tariff.ID, tariff.name)" class="ml-2 font-weight-bold">{{ tariff.name }}</div>
        </div>


        <table @click="showHistory(tariff.ID, tariff.name)" class="table table-bordered">
            <template v-for="(kit, kitName) in tariff.value">
                <tr v-for="(equipment, i) in kit">
                    <td v-if="i==0" :rowspan="kit.length">{{ kitName }}</td>

                    <td>{{ equipment.name }}</td>

                    <td>{{ equipment.value }}</td>
                </tr>
            </template>
        </table>
    </div>

    <div class="d-flex align-items-center p-2">

        <button @click="add('', newName)" class="btn btn-success btn-sm">
            <font-awesome-icon icon="plus"/>
        </button>

        <input type="text" class="form-control ml-1" v-model="newName">
    </div>
</div>
</template>

<script>

import { mapActions } from 'vuex';

export default {
    props: ["data", "FirmID", "FirmName", "addPanel"],
    data: function()
    {
        return {
            newName: "",
            changeID: undefined,
            changeName: ""
        }
    },
    computed:
    {
        tariffs: function()
        {
            let res = [];

            this.data.forEach((tariff) => {

                let cur = {ID: tariff.TariffID, name: tariff.TariffName, value: {}};

                for(let kit in tariff.Value)
                {
                    cur.value[kit] = [];
                    for(let equipment in tariff.Value[kit])
                    {
                        cur.value[kit].push({name: equipment, value: tariff.Value[kit][equipment]});
                    }
                }
                res.push(cur);
            });

            return res;
        }
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        showHistory: function(ID, name)
        {
            //let label = this.vuexGet("Objects", this.FirmID, this.FirmID, "info", "name") + " " + name;

            this.addPanel("TariffsTOHistory", this.FirmName + " " + name, {FirmID: this.FirmID, TariffID: ID});
        },
        Delete: function(ID)
        {
            let ok = confirm("Вы уверены, что хотите удалить тариф?");

            if(!ok) return;

            this.newName = "", this.changeID = undefined;

            let change = this.$parent.change;

            function accepted()
            {
                change("done", "Тариф удален");
            }

            function rejected(message)
            {
                change("error", "Произошла ошибка при удалении тарифа: " + message);
            }

            change("changing", "Удаление тарифа");
            
            this.SEND_DATA({query: {
                                func: "TariffTODelete",
                                FirmID: this.FirmID,
                                TariffID: ID
                           },
                           accepted: accepted,
                           rejected: rejected});
        },
        add: function(ID, name)
        {
            this.newName = "", this.changeID = undefined;

            let change = this.$parent.change;

            function accepted()
            {
                let message = (ID) ? "Наименование тарифа изменено" : "Тариф создан";
                
                change("done", message);
            }

            function rejected(message)
            {
                let msg = "Произошла ошибка при " + ((ID) ? "изменении наименования тарифа: " : "создании тарифа: ") + message;
                
                change("error", msg);
            }

            let message = (ID) ? "Изменение наименования тарифа" : "Создание тарифа";
            
            change("changing", message);
            
            this.SEND_DATA({query: {
                                func: "TariffTOWrite",
                                FirmID: this.FirmID,
                                TariffID: ID,
                                TariffName: name
                           },
                           accepted: accepted,
                           rejected: rejected});
        }
    }
}

</script>
