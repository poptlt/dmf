<template>
    <select v-if="created" class="form-control" v-model="value" v-on:change="change">
        <option v-for="item in List" :value="item.ID">{{ item.Name }}</option>
    </select>
</template>

<script>
export default {
    props: ["List"],
    data: function()
    {
        return {
            value: this.List[0].ID,
        }
    },
    computed:
    {
        created: function()
        {
            this.$emit("change", this.List[0].ID);
            
            return true;
        }
    },
    methods:
    {
        change: function()
        {
            this.$emit("change", this.value);
        }
    }
}
</script>

<style>
    
</style>