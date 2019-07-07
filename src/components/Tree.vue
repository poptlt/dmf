<template>

    <div style="padding: 10px">
        <template v-if="roots !== null">
            <template v-if="!FirmID">
                <TreeVertex v-for="(val, FirmID) in roots" :addPanel="addPanel" :FirmID="FirmID" :ObjectID="FirmID" :Name="roots[FirmID][FirmID].Name"/>
            </template>
            <template v-else>
                <TreeVertex :addPanel="addPanel" :FirmID="FirmID" :ObjectID="ObjectID" :Name="roots[FirmID][ObjectID].Name"/>
            </template>
        </template>
        <div v-else style="display: flex; justify-content: center; align-items: center">
            <v-progress-circular :size="50" indeterminate style="color: blue"></v-progress-circular>
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
        ...mapState({roots: "Objects"})
    }
}
</script>

<style>

</style>
