<template>

<div style="padding: 10px">
    <TreeVertex v-for="node in roots"
                :object="node.Object"
                v-bind="node"
                :addPanel="addPanel"
                :showObject="showObject"/>
</div>

</template>

<script>

import TreeVertex from './TreeVertex.vue';

export default {
    components:
    {
        TreeVertex
    },
    props: ["addPanel", "showObject", "roots"],
}
</script>

<style>

</style>
