<template>
    <div>
        <center v-if="!List" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="List.DMF_ERROR" class="alert alert-danger">{{ List.message }}</div>

        <table v-else class="table table-hover">
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
        root: function()
        {
            if(this.Objects && this.Objects[this.FirmID] && this.Objects[this.FirmID][this.ObjectID])
            {
                return this.Objects[this.FirmID][this.ObjectID];
            }
            else return null;
        },
        List: function()
        {
            if(this.root && this.root.LS)
            {
                if(this.root.LS.DMF_ERROR) return this.root.LS;

                let res = [];

                for(let i=0; i<this.root.LS.length; i++)
                {
                    res[i] = {};
                    res[i].ID = this.root.LS[i].ObjectID;
                    res[i].Balance = this.root.LS[i].Balance;
                    res[i].Number = this.Objects[this.FirmID][res[i].ID].Number;
                    res[i].AdressAdd = this.Objects[this.FirmID][res[i].ID].AdressAdd;
                }
                return res;
            }
            else
            {
                if(!this.root || this.root.LS === undefined) this.reload();
                return null;
            }
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
        }
    }
}
</script>

<style>

</style>
