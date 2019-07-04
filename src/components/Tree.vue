<template>

    <div style="padding: 10px">
        <template v-if="roots!='loading'">
            <TreeVertex v-for="(val, key) in roots" :root="val" :noParent="true"/>
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
    computed:
    {
        ...mapState({roots: "Objects"})
    }
}
</script>

<style>

</style>
