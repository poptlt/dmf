<template>
    <div v-if="roots !== undefined">
        <center v-if="!roots" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="roots.DMF_ERROR" class="alert alert-danger">{{ roots.message }}</div>

        <div v-else style="padding: 10px">

            <TreeVertex v-for="node in roots" :addPanel="addPanel" :FirmID="node.FirmID" :ObjectID="node.ObjectID" :Name="node.name"/>

        </div>
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
    props: ["addPanel", "FirmID", "ObjectID"],
    computed:
    {
        queries: function()
        {
            return {

                roots: {func: "TreeLevel", FirmID: "", ObjectID: ""}
            };
        },
        roots: function()
        {
            return this.vuexLoad(this.queries).roots;
        }
    },
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
