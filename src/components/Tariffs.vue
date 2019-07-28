<template>
    <div v-if="tariffs !== undefined">
        
        <center v-if="!tariffs" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="tariffs.DMF_ERROR" class="alert alert-danger">{{ tariffs.message }}</div>
        
        <template v-else>
            <table class="table table-hover">
                <tbody>
                    <tr v-for="(item, ID) in tariffs">
                        <td class="p-1">
                            <button @click="Delete(ID)" class="btn btn-danger btn-sm">
                                <font-awesome-icon icon="times"/>
                            </button>
                        </td>
                        <td @click="showHistory(ID, item.TariffName)">{{ item.TariffName }}</td>
                        <td @click="showHistory(ID, item.TariffName)" class="text-right">{{ item.Value }}</td>
                    </tr>
                </tbody>
            </table>
        
            <div class="d-flex">
                <div class="flex-grow-0 p-1">
                    <button @click="add" class="btn btn-success btn-sm">
                        <font-awesome-icon icon="plus"/>
                    </button>
                </div>
                <input type="text" class="form-control m-1" v-model="newName">
            </div>
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
            
            newName: ""
        }
    },
    computed:
    {
        ...mapState(["Objects"]),
    },
    methods:
    {
        showHistory: function(ID, Name)
        {
            this.addPanel("History", this.Objects[this.FirmID][this.FirmID].Name + ' ' + Name, {AttrType: "Tariffs", FirmID: this.FirmID, ObjectID: this.FirmID, AttrID: ID});
        },
        Delete: function(ID)
        {
            console.log(ID);
        },
        add: function()
        {
            console.log(this.newName);
        }
    }
}
</script>

<style>
    
</style>