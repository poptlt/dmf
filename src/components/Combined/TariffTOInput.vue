<template>
<div v-if="created" class="d-flex align-items-center p-1">

    <button v-if="newValue !== undefined" @click="add" class="btn btn-success btn-sm">
                                <font-awesome-icon icon="plus"/>
                            </button>

</div>
</template>

<script>
export default {
    props: ["tariffs"],
    computed:
    {
        created: function()
        {

        }
    },
    methods:
    {
        add: function()
        {
            this.
        }
    }
}
</script>

<style>

</style>
