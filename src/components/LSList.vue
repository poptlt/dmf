<template>
    <div v-if="isNotEmpty">
        <center v-if="List === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="List.DMF_ERROR" class="alert alert-danger">{{ List.message }}</div>
        
        <table v-else class="table">
            <tbody>
                <tr v-for="LS in List" @click="showObject(LS.ID)">
                    <td>{{ LS.Number }}</td>
                    <td>{{ LS.AdressAdd }}</td>
                    <td class="text-right">{{ LS.Balance }}</td>
                </tr>
            </tbody>
        </table>
        
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["FirmID", "ObjectID", "addPanel"],
    computed:
    {
        ...mapState(["Objects"]),
        
        isNotEmpty: function() {
             let data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'LS']);
            
            if (data === undefined) {
                this.reload(); 
                let data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'LS']);
                if (data === undefined) {return false}
                else {return true}
            }
            else {return true}            
        },
        
        List: function() { 
            
            let data = this.dataState(this.Objects, [this.FirmID, this.ObjectID, 'LS']);
 
            if (data === undefined) {
                
                console.log("undef");
                
                return undefined;
            }
            
            if (data === null) {return null}
            
            if (data.DMF_ERROR) {return data}

            let res = [];

            for(let i=0; i<data.length; i++) {
                res[i] = {};
                res[i].ID = data[i].ObjectID;
                res[i].Balance = data[i].Balance;
                res[i].Number = this.Objects[this.FirmID][res[i].ID].Number;
                res[i].AdressAdd = this.Objects[this.FirmID][res[i].ID].AdressAdd;
            }
            return res;             
        }
    },
    
    methods:
    {
        ...mapActions(['LOAD_LS_LIST']),
        showObject: function(ID)
        {
            let Name = this.Objects[this.FirmID][ID].Name, ObjectType = this.Objects[this.FirmID][ID].Type;

            this.addPanel("Object", Name, {FirmID: this.FirmID, ObjectID: ID, ObjectType: ObjectType});
        },
        reload: function()
        {
            this.LOAD_LS_LIST({FirmID: this.FirmID, ObjectID: this.ObjectID, refresh: true});
        },
        root: function()
        {
            //console.log("computing root");
            
            if(this.Objects && this.Objects[this.FirmID] && this.Objects[this.FirmID][this.ObjectID])
            {
                return this.Objects[this.FirmID][this.ObjectID];
            }
            else return undefined;
        }
    }
}
</script>

<style>

</style>
