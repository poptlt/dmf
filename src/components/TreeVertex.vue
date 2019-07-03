<template>
    <div>
        <div style="display: flex">
            <div style="width: 30px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-start">
                <v-icon size="18" color="blue" style="border: 1px solid blue; border-radius: 10px;">add</v-icon>
                <div style="flex-grow: 1; padding-left: 10px">
                    <div style="height: 100%; border-left: 1px solid blue"/>
                </div>
            <div></div>
            </div>
            <div class="title">{{root.label}}</div>
        </div>
        <div v-if="root.children" style="padding-left: 10px">
            <div v-for="(child, i) in root.children" style="display: flex">
                <div style="width: 10px; flex-shrink: 0; display: flex; flex-direction: column">
                    <div style="height: 10px; flex-shrink: 0; border-left: 1px solid blue; border-bottom: 1px solid blue"></div>
                    <div v-if="i+1<root.children.length" style="flex-grow: 1; border-left: 1px solid blue"></div>
                </div>
                <TreeVertex :root="child"/>
            </div>
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
