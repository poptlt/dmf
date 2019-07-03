<template>
    <div>
        <div style="display: flex">
            {{root.label}}
        </div>
        <div v-if="root.children" style="padding-left: 10px">
            <TreeVertex v-for="child in root.children" :root="child"/>
        </div>
    </div>
</template>

<script>

export default {
    name: "TreeVertex",
    props:
    {
        root: {},
        noParent:
        {default: false}
    },
}
</script>

<style>

</style>
