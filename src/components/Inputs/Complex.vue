<template>
    <div>
        <select class="form-control mb-1" v-model="value" v-on:change="change">
            <option value="TypeUser">Другое (указать)</option>
            <option v-for="item in List" :value="item.ID">{{ item.Name }}</option>
        </select>
        <component :is="TypeUser.Type" v-if="value == 'TypeUser'" v-bind="TypeUser" @change="userChange"/>
    </div>
</template>

<script>
    
import String from './String.vue';
    
import Number from './Number.vue';
    
export default {
    props: ["List", "TypeUser"],
    components:
    {
        String, Number
    },
    data: function()
    {
        return {
            value: "TypeUser"
        }
    },
    methods:
    {
        change: function(val)
        {            
            if(this.value != "TypeUser") this.$emit("change", this.value);
        },
        userChange: function(val)
        {
            this.$emit("change", val);
        }
    }
}
</script>

<style>
    
</style>