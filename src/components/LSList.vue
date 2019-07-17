<template>
    <div>
        <table v-if="List" class="table table-hover">
            <tbody>
                <tr v-for="LS in List" @click="showObject(LS.ID)">
                    <td>{{ LS.Number }}</td>
                    <td>{{ LS.AdressAdd }}</td>
                    <td class="text-right">{{ LS.Balance }}</td>
                </tr>
            </tbody>
        </table>
        <center v-else class="text-primary"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["info", "addPanel"],
    computed:
    {
        ...mapState(["Objects"]),
        root: function()
        {
            let FirmID = this.info.FirmID, ObjectID = this.info.ObjectID;

            if(this.Objects && this.Objects[FirmID] && this.Objects[FirmID][ObjectID])
            {
                return this.Objects[FirmID][ObjectID];
            }
            else return null;
        },
        List: function()
        {
            if(this.root && this.root.LS)
            {
                let res = [];

                for(let i=0; i<this.root.LS.length; i++)
                {
                    res[i] = {};
                    res[i].ID = this.root.LS[i].ObjectID;
                    res[i].Balance = this.root.LS[i].Balance;
                    res[i].Number = this.Objects[this.info.FirmID][res[i].ID].Number;
                    res[i].AdressAdd = this.Objects[this.info.FirmID][res[i].ID].AdressAdd;
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
            let FirmID = this.info.FirmID, Name = this.Objects[FirmID][ID].Name;

            this.addPanel("Object", Name, {FirmID: FirmID, ObjectID: ID});
        },
        reload: function()
        {
            this.LOAD_LS_LIST({FirmID: this.info.FirmID, ObjectID: this.info.ObjectID, refresh: true});
        }
    }
}
</script>

<style>

</style>
