<template>
    
    <center v-if="state == 'changing'">{{ message }}</center>

    <div v-else-if="state == 'done'" :class="{alert: true, 'alert-success': !error, 'alert-danger': error}" class="d-flex">
        <div>{{ message }}</div>
        <button @click="state = 'show'" class="flex-grow-0"><font-awesome-icon icon="times"/></button>
    </div>
    
    <div v-else>
        <template v-if="tariffs !== undefined">

            <center v-if="!tariffs" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

            <div v-else-if="tariffs.DMF_ERROR" class="alert alert-danger">{{ tariffs.message }}</div>

            <template v-else>
                <table class="table table-hover">
                    <tbody>
                        <tr v-for="(item, ID) in tariffs">

                            <td v-if="ID == changeID" class="p-1">
                                <button @click="changeID = undefined" class="btn btn-primary btn-sm">
                                    <font-awesome-icon icon="chevron-left"/>
                                </button>
                                <button @click="add(ID, changeName)" class="btn btn-success btn-sm ml-1">
                                    <font-awesome-icon icon="check"/>
                                </button>
                            </td>

                            <td v-else class="p-1">
                                <div class="d-flex">
                                    <button @click="Delete(ID)" class="btn btn-danger btn-sm flex-grow-0">
                                        <font-awesome-icon icon="times"/>
                                    </button>
                                    <button @click="changeID = ID; changeName = item.TariffName" class="btn btn-primary btn-sm ml-1 flex-grow-0">
                                        <font-awesome-icon icon="edit"/>
                                    </button>
                                </div>
                            </td>

                            <td v-if="ID == changeID" class="p-1"><input v-model="changeName" type="text" class="form-control"/></td>

                            <td v-else @click="showHistory(ID, item.TariffName)">{{ item.TariffName }}</td>

                            <td @click="showHistory(ID, item.TariffName)" class="text-right">{{ item.Value }}</td>

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
            </template>

        </template>
    </div>

</template>

<script>

import { mapActions, mapState } from 'vuex';
    
export default {
    props: ["tariffs", "FirmID", "addPanel"],
    data: function()
    {
        return {
            
            newName: "",
            
            changeID: undefined,
            changeName: "",
            
            state: "show",
            message: "",
            error: false
        }
    },
    computed:
    {
        ...mapState(["Objects"]),
    },
    methods:
    {
        ...mapActions(["WRITE_TARIFF"]),
        showHistory: function(ID, Name)
        {
            this.addPanel("History", this.Objects[this.FirmID][this.FirmID].Name + ' ' + Name, {AttrType: "Tariffs", FirmID: this.FirmID, ObjectID: this.FirmID, AttrID: ID});
        },
        Delete: function(ID)
        {
            let ok = confirm("Вы уверены, что хотите удалить тариф?");

            if(!ok) return;

            this.newName = "", this.changeID = undefined;
            
            let th = this;
            
            function accepted()
            {
                th.state = "done", th.error = false, th.message = "Тариф удален";
            }
            
            function rejected(message)
            {
                th.state = "done", th.error = true;
                th.message = "Произошла ошибка при удалении тарифа: " + message;
            }
            
            this.state = "changing", this.message = "Удаление тарифа...";
            
            this.WRITE_TARIFF({operation: "delete", FirmID: this.FirmID, TariffID: ID, accepted: accepted, rejected: rejected});
        },
        add: function(ID, Name)
        {
            this.newName = "", this.changeID = undefined;
            
            let th = this;
            
            function accepted()
            {
                th.state = "done", th.error = false;
                th.message = (ID) ? "Наименование тарифа изменено" : "Тариф создан";
            }
            
            function rejected(message)
            {
                th.state = "done", th.error = true;
                th.message = "Произошла ошибка при " + ((ID) ? "изменении наименования тарифа: " : "создании тарифа: ") + message;
            }
            
            this.state = "changing";
            this.message = (ID) ? "Изменение наименования тарифа..." : "Создание тарифа...";
                        
            this.WRITE_TARIFF({operation: "change", FirmID: this.FirmID, TariffID: ID, TariffName: Name, accepted: accepted, rejected: rejected});
        }
    }
}
</script>

<style>
    
</style>
