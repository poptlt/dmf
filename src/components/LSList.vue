<template>
    <div v-if="List !== undefined">
       

            <v-data-table :headers="headers" :items="items"  :loading="(List==null) ? true : false" hide-actions disable-initial-sort class="subheading">
                <v-progress-linear v-slot:progress color="blue" indeterminate></v-progress-linear>
                <template v-slot:no-data>
                    <center>
                        <v-progress-circular :size="50" color="blue" indeterminate/>
                    </center>
                </template>

                <template v-slot:headers="props">
                    <tr>
                        <th v-for="header in props.headers" style="font-size: 18px; padding: 10px" class="font-weight-bold black--text blue lighten-4">
                            {{ header.text }}
                        </th>
                    </tr>
                </template>

                <template v-slot:items="props">
                <tr @click="showObject(props.item.ID)">
                    <td style="font-size: 18px; padding: 10px" class="text-xs-center">{{ props.item.Number }}</td>
                    <td style="font-size: 18px; padding: 10px" class="text-xs-center">{{ props.item.AdressAdd }}</td>
                    <td style="font-size: 18px; padding: 10px" class="text-xs-right">{{ props.item.Balance }}</td>
                </tr>
                </template>
            </v-data-table>

        
        
    </div>

</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["info", "addPanel"],
    data: function()
    {
        return {
            
            headers:
            [
                {text: "Лицевой счет", value: "Number", sortable: false},
                {text: "Квартира", value: "AdressAdd", sortable: false},
                {text: "Задолжность", value: "Balance", sortable: false},
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

            console.log(this.root.LS);
                        
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
                    res[res.length-1].ID = ID;
                }
            }

            console.log(res);
                        
            return res;
        }

    },
    methods:
    {
        ...mapActions(['LOAD_LS_LIST']),
        showObject: function(ID)
        {
            let FirmID = this.info.FirmID, Name = this.Objects[FirmID][ID].Number;

            this.addPanel("Object", Name, {FirmID: FirmID, ObjectID: ID});
        }
    }
}
</script>

<style>

</style>
