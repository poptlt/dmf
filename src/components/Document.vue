<template>
    <div v-if="Document !== undefined">
        
        <center v-if="Document === null" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
        
        <div v-else-if="Document.DMF_ERROR" class="alert alert-danger">{{ Document.message }}</div>
        
        <template v-else>
            
            <table class="table">
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
                <div v-if="typeof(val) == 'object'" class="card">
                    <div class="card-header">{{ key }}</div>
                    <div class="card-body p-0">
                        <div v-for="item in val" class="d-flex flex-wrap border-bottom">
                            <div v-for="(value, prop) in item" class="p-2 flex-grow-0"><span class="font-weight-bold">{{ prop }}: </span>{{ value }}</div>
                        </div>
                    </div>
                </div>
            </template>
            
        </template>
    </div>
</template>

<script>
    
import { mapActions, mapState } from 'vuex';
    
export default {
    props: ["DocumentID"],
    computed:
    {
        ...mapState(["Documents"]),
        
        Document: function()
        {
            let data = this.dataState(this.Documents, [this.DocumentID]);
            
            if(data === undefined) this.reload();
            
            data = this.dataState(this.Documents, [this.DocumentID]);
            
            if(data && data.DocumentName) this.$emit("setLabel", data.DocumentName);
            
            return data;
        }
    },
    methods:
    {
        ...mapActions(["LOAD_DOCUMENT"]),
        reload: function()
        {
            this.LOAD_DOCUMENT({DocumentID: this.DocumentID});
        }
    }
}
</script>

<style>
    
</style>
