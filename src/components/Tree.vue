<template>

<div style="padding: 10px">
    <TreeVertex v-for="node in roots" v-bind="node" :addPanel="addPanel"/>
</div>

</template>

<script>

import TreeVertex from './TreeVertex.vue';

export default {
    components:
    {
        TreeVertex
    },
    props: ["addPanel", "roots"],
}
</script>

<style>

</style>
