<template>
    <div>
        <center v-if="!roots" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
        <div v-else-if="roots.DMF_ERROR" class="alert alert-danger">{{ roots.message }}</div>
        <div v-else style="padding: 10px">

            <template v-if="!FirmID">
                <TreeVertex v-for="(val, FirmID) in roots" :addPanel="addPanel" :FirmID="FirmID" :ObjectID="FirmID" :Name="roots[FirmID][FirmID].Name"/>
            </template>
            <template v-else>
                <TreeVertex :addPanel="addPanel" :FirmID="FirmID" :ObjectID="ObjectID" :Name="roots[FirmID][ObjectID].Name"/>
            </template>

        </div>
    </div>
</template>

<script>

import TreeVertex from './TreeVertex.vue';

import { mapState } from 'vuex';

export default {
    components: {TreeVertex},
    props: ["addPanel", "FirmID", "ObjectID"],
    computed:
    {
        ...mapState(["Objects"]),
        roots: function()
        {
            if(this.Objects === undefined) this.reload();

            return this.Objects;
        }
    },
    methods:
    {
        reload: function()
        {            
            this.$store.dispatch('INIT');
        }
    }
}
</script>

<style>

</style>
