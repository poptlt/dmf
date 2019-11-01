<template>

<div style="padding: 10px">
    <TreeVertex v-for="node in roots"
                :object="node.Object"
                v-bind="node"
                :addPanel="addPanel"
                :showObject="showObject"/>
    
    <br>
    <div style="font-size: 18px">
        <span class="badge badge-secondary">Отличается оборудование</span>
        <br>
        <span class="badge badge-success">Отличается состояние оборудования</span>
        <br>
        <span class="badge badge-warning">Отличаются тарифы</span>
    </div>
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
