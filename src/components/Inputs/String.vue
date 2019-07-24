<template>
    <input type="text" class="form-control" v-model="value" v-on:input="change">
</template>

<script>
export default {
    props: ["Length"],
    data: function()
    {
        return {
            value: ""
        }
    },
    methods:
    {
        change: function()
        {
            let val = (this.value.length >0 && this.value.length <= this.Length) ? this.value : undefined;
            
            this.$emit("change", val);
        },
        clear: function()
        {
            this.value = "";
            
            this.change();
        }
    }
        
}
</script>

<style>
    
</style>