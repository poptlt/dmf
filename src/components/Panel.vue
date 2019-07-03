<template>
    <v-layout column style="height: 100%">
        <v-layout shrink justify-space-between class="cyan">
            <h2 class="white--text pa-2">{{ label }}</h2>
            <v-btn v-if="!first" v-on:click="onDelete" fab small dark color="red">
                <span><v-icon>close</v-icon></span>
            </v-btn>
        </v-layout>
        <div class="grow" style="overflow: auto">
            <component :is="type" :depth="3"/>
            <!--<v-btn v-on:click="onAdd(1)">Добавить 1</v-btn><br>
            <v-btn v-on:click="onAdd(2)">Добавить 2</v-btn><br>-->
        </div>
    </v-layout>
</template>

<script>

import Tree from './Tree.vue'

export default {
    components:
    {
        Tree
    },
    props:
    {
        first:
        {
            default: false
        },
        type:
        {
            type: String,
            default: "Tree"
        },
        label: {}
    },
    methods:
    {
        onAdd: function(type)
        {
            console.log(this.first);

            this.$emit('add', type);
        },
        onDelete: function()
        {
            this.$emit('delete');
        }
    }
}
</script>

<style>

</style>
