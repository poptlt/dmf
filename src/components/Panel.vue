<template>
    <div style="display: flex; flex-direction: column; height: 100%">
        <div v-if="!main" style="display: flex; " class="cyan">
            <h2 style="flex-grow: 1" class="white--text pa-2">{{ label }}</h2>
            <v-btn v-on:click="remove" fab small dark color="red">
                <span><v-icon>close</v-icon></span>
            </v-btn>
        </div>
        <div style="overflow: auto; flex-grow: 1">
            <component :is="type" :info="info" :addPanel="addPanel"/>
        </div>
    </div>
</template>

<script>

import Tree from './Tree.vue'

import LSList from './LSList.vue'

import Object from './Object.vue'

export default {
    components:
    {
        Tree, LSList, Object
    },
    props:
    {
        main:
        {
            type: Boolean,
            default: false
        },
        type:
        {
            type: String,
            default: "Tree"
        },
        label:
        {
            type: String,
            default: ""
        },
        info: {},
        addPanel: {}

    },
    methods:
    {
        remove: function()
        {
            this.$emit('delete');
        }
    }
}
</script>

<style>

</style>
