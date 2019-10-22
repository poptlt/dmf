<template>
<div v-if="created">
            
    <table class="table table-hover">
        <tbody>
            <template v-for="(val, key) in document.Value">
                <tr v-if="typeof(val) != 'object'">
                    <td>{{ key }}</td>
                    <td>{{ val }}</td>
                </tr>
            </template>
        </tbody>
    </table>

    <template v-for="(val, key) in document.Value">
        <div v-if="typeof(val) == 'object'">
            <div class="bg-secondary text-white" style="padding: 12px 20px">{{ key }}</div>

            <div v-for="item in val" class="d-flex flex-wrap border-bottom">
                <div v-for="(value, prop) in item" class="p-2 flex-grow-0"><span class="font-weight-bold">{{ prop }}: </span>{{ value }}</div>
            </div>
        </div>
    </template>
            
</div>
</template>

<script>
        
export default {
    props: ["FirmID", "DocumentID", "document", "setHeader"],
    computed:
    {
        created: function()
        {
            this.setHeader(this.document.Name);
            
            return true;
        }
    },
}
</script>

<style>
    
</style>
