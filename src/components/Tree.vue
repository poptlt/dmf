<template>

<div style="padding: 10px">
    <TreeVertex v-for="node in roots" v-bind="node" :addPanel="addPanel"/>
</div>

</template>

<script>

import TreeVertex from './TreeVertex.vue';

import { mapMutations } from 'vuex';

export default {
    components:
    {
        TreeVertex
    },
    props: ["addPanel", "roots"],
    methods:
    {
        ...mapMutations(['DESTROY_TREE']),
        reload: function()
        {            
            this.DESTROY_TREE();
        }
    }
}
</script>

<style>

</style>
