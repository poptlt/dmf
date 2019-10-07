<template>
<div>
    <table class="table table-hover">
        <tbody>
            <tr v-for="item in tariffs">

                <td v-if="item.TariffID == changeID" class="p-1">
                    <button @click="changeID = undefined" class="btn btn-primary btn-sm">
                        <font-awesome-icon icon="chevron-left"/>
                    </button>
                    <button @click="add(item.TariffID, changeName)" class="btn btn-success btn-sm ml-1">
                        <font-awesome-icon icon="check"/>
                    </button>
                </td>

                <td v-else class="p-1">
                    <div class="d-flex">
                        <button @click="Delete(item.TariffID)" class="btn btn-danger btn-sm flex-grow-0">
                            <font-awesome-icon icon="times"/>
                        </button>
                        <button @click="changeID = item.TariffID; changeName = item.TariffName" class="btn btn-primary btn-sm ml-1 flex-grow-0">
                            <font-awesome-icon icon="edit"/>
                        </button>
                    </div>
                </td>

                <td v-if="item.TariffID == changeID" class="p-1"><input v-model="changeName" type="text" class="form-control"/></td>

                <td v-else @click="showHistory(item.TariffID, item.TariffName)">{{ item.TariffName }}</td>

                <td @click="showHistory(item.TariffID, item.TariffName)" class="text-right">{{ item.Value }}</td>

            </tr>
        </tbody>
    </table>

    <div class="d-flex">
        <div class="flex-grow-0 p-1">
            <button @click="add('', newName)" class="btn btn-success btn-sm">
                <font-awesome-icon icon="plus"/>
            </button>
        </div>
        <input type="text" class="form-control m-1" v-model="newName">
    </div>
</div>
</template>

<script>

import { mapActions } from 'vuex';

export default {
    props: ["tariffs", "FirmID", "FirmName", "addPanel"],
    data: function()
    {
        return {
            newName: "",
            changeID: undefined,
            changeName: "",
        }
    },
    methods:
    {
        ...mapActions(["SEND_DATA"]),
        showHistory: function(ID, Name)
        {
            this.addPanel("History", this.FirmName + " " + Name, {AttrType: "Tariffs", FirmID: this.FirmID, ObjectID: this.FirmID, AttrID: ID});
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
                                func: "TariffDelete",
                                FirmID: this.FirmID,
                                TariffID: ID
                           },
                           accepted: accepted,
                           rejected: rejected});
        },
        add: function(ID, Name)
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
                                func: "TariffWrite",
                                FirmID: this.FirmID,
                                TariffID: ID,
                                TariffName: Name
                           },
                           accepted: accepted,
                           rejected: rejected});
        }
    }
}
</script>

<style>

</style>
