<template>

    <div style="height: 100%" class="d-flex flex-column">
        <div class="flex-grow-0 d-flex align-items-start bg-primary">
            <div class="p-1 text-light" style="font-size: 20px">{{ label }}</div>
            <button @click="reload" class="flex-grow-0 m-1 bg-light btn btn-outline-primary btn-sm">
                <font-awesome-icon icon="sync-alt" fixed-width/>
            </button>
            <button v-if="!main" @click="remove" class="flex-grow-0 m-1 bg-light btn btn-outline-primary btn-sm">
                <font-awesome-icon icon="times" fixed-width/>
            </button>
        </div>
        <div style="overflow: auto">
            <!--<h5 v-if="!main" class="text-xs-center">{{ Objects[info.FirmID][info.FirmID].Name }}</h5>-->
            <component :is="type" ref="content" v-bind="info" :addPanel="addPanel"/>
        </div>
    </div>

</template>

<script>

import Tree from './Tree.vue'

import LSList from './LSList.vue'

import Object from './Object.vue'
    
import History from './History.vue'

import { mapState } from 'vuex';

export default {
    components:
    {
        Tree, LSList, Object, History
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
    computed:
    {
        ...mapState(["Objects"]),
    },
    methods:
    {
        remove: function()
        {
            this.$emit('delete');
        },
        reload: function()
        {
            this.$refs.content.reload();
        }
    }
}
</script>

<style>

</style>
