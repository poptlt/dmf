<template>
    <div v-if="List !== undefined">
        <center v-if="List === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

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

export default {
    props: ["FirmID", "ObjectID", "addPanel"],
    computed:
    {
        queries: function()
        {
            return {

                list: {func: "LSList", FirmID: this.FirmID, ObjectID: this.ObjectID}
            }
        },
        List: function()
        {
            let list = this.vuexLoad(this.queries).list;
            
            if(!list || list.DMF_ERROR) return list;

            let res = [];

            list.forEach((LS) => {
                
                let Number = this.vuexGet("Objects", this.FirmID, LS.ObjectID, "info", "Number");
                
                let AdressAdd = this.vuexGet("Objects", this.FirmID, LS.ObjectID, "info", "AdressAdd");

                res.push({ID: LS.ObjectID, Balance: LS.Balance, Number: Number, AdressAdd: AdressAdd});
            });
            
            return res;
        }
    },
    methods:
    {
        reload: function()
        {
            this.vuexClear(this.queries);
        },
        showObject: function(ID)
        {
            let name = this.vuexGet("Objects", this.FirmID, ID, "info", "name");

            this.addPanel("Object", name, {FirmID: this.FirmID, ObjectID: ID});
        }
    }
}
</script>

<style>

</style>
