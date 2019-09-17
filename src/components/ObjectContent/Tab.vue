<template>
    <div class="border rounded">
        <div class="bg-secondary text-white rounded-top" style="padding: 12px 20px" @click="collapse()">{{ label }}</div>
        <b-collapse :id="ID" :accordion="accordionID" :visible="visible">
            <slot></slot>
        </b-collapse>
    </div>
</template>

<script>
export default {
    props:
    {
        accordionID: {},
        visible: { default: false },
        label: {}
    },
    data: function()
    {
        return { ID: "id"+(""+Math.random()).substring(2) }
    },
    methods:
    {
        collapse: function()
        {
            this.$root.$emit('bv::toggle::collapse', this.ID);
        }
    }
}
</script>
