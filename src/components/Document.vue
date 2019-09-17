<template>
    <div v-if="Document !== undefined">
        
        <center v-if="Document === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
        
        <div v-else-if="Document.DMF_ERROR" class="alert alert-danger">{{ Document.message }}</div>
        
        <template v-else>
            
            <table class="table table-hover">
                <tbody>
                    <template v-for="(val, key) in Document">
                        <tr v-if="typeof(val) != 'object' && key != 'DocumentName'">
                            <td>{{ key }}</td>
                            <td>{{ val }}</td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <template v-for="(val, key) in Document">
                <div v-if="typeof(val) == 'object'">
                    <div class="bg-secondary text-white" style="padding: 12px 20px">{{ key }}</div>

                    <div v-for="item in val" class="d-flex flex-wrap border-bottom">
                        <div v-for="(value, prop) in item" class="p-2 flex-grow-0"><span class="font-weight-bold">{{ prop }}: </span>{{ value }}</div>
                    </div>
                </div>
            </template>
            
        </template>
    </div>
</template>

<script>
    
//import { mapActions, mapState } from 'vuex';
    
export default {
    props: ["FirmID", "DocumentID"],
    data: function()
    {
        return {

            queries:
            {
                data: {func: "GetDoc", FirmID: this.FirmID, DocumentID: this.DocumentID}
            }
        }
    },
    computed:
    {
        //...mapState(["Documents"]),
        
        Document: function()
        {
            /*let data = this.dataState(this.Documents, [this.DocumentID]);
            
            if(data === undefined) this.reload();
            
            data = this.dataState(this.Documents, [this.DocumentID]);
            
            if(data && data.DocumentName) this.$emit("setLabel", data.DocumentName);
            
            return data;*/

            let data = this.vuexLoad(this.queries).data;

            if(data && data.DocumentName) this.$emit("setLabel", data.DocumentName);

            return data;
        }
    },
    methods:
    {
        //...mapActions(["LOAD_DOCUMENT"]),
        reload: function()
        {
            this.vuexClear(this.queries);
            //this.LOAD_DOCUMENT({DocumentID: this.DocumentID});
        }
    }
}
</script>

<style>
    
</style>
