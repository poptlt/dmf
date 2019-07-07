<template>
    <div v-if="List !== undefined">
       
            <v-app>
            <v-data-table :headers="headers" :items="items" >
                <template v-slot:items="props">
                <tr>
                    <td class="text-xs-right">{{ props.item.Number }}</td>
                    <td class="text-xs-right">{{ props.item.Balance }}</td>
                </tr>
                </template>
            </v-data-table>
            </v-app>
        
        
    </div>

</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["info"],
    data: function()
    {
        return {
            
            headers:
            [
                {text: "Номер", value: "Number"},
                {text: "Баланс", value: "Balance"}
            ]
        }
    },
    computed:
    {
        ...mapState(["Objects"]),
        root: function()
        {
            let FirmID = this.info.FirmID, ObjectID = this.info.ObjectID;
            
            return this.Objects[FirmID][ObjectID];
        },
        List: function()
        {
            if(this.root.LS === undefined)
            {
                this.LOAD_LS_LIST({FirmID: this.info.FirmID, ObjectID: this.info.ObjectID});
            }
                        
            return this.root.LS;
        },
        items: function()
        {            
            let res = [];
            if(this.List)
            {
                for(let i=0; i<this.List.length; i++)
                {
                    let ID = this.List[i].ObjectID;
                    res.push(this.Objects[this.info.FirmID][ID]);
                }
            }
                        
            return res;
        }

    },
    methods:
    {
        ...mapActions(['LOAD_LS_LIST']),
    }
}
</script>

<style>

</style>
