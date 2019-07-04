<template>
    <div>
        <div style="display: flex">
            <div style="width: 30px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-start">
                <div v-if="root.ChildrenQnt==0" style="width: 20px; height: 10px; border-bottom: 1px solid blue"/>
                <template v-else>

                    <div style="width: 20px; height: 20px; border: 1px solid blue; border-radius: 10px; display: flex; justify-content: center; align-items: center" @click="expand">

                        <v-icon v-if="!opened" size="18" style="color: blue">add</v-icon>

                        <v-icon v-else-if="opened && root.Children!='loading'" size="18" style="color: blue">remove</v-icon>

                        <v-progress-circular v-else :size="12" :width="2" indeterminate style="color: blue"></v-progress-circular>

                    </div>
                    <div v-show="opened && root.Children!='loading'" style="flex-grow: 1; padding-left: 10px">
                        <div style="height: 100%; border-left: 1px solid blue"/>
                    </div>
                </template>
            </div>
            <div style="font-size: 18px; padding-bottom: 5px">{{root.Name}}</div>
        </div>

        <div v-if="opened && root.Children!='loading' && root.Children!=null" style="padding-left: 10px">

                <div v-for="(child, i) in root.Children" style="display: flex">
                    <div style="width: 10px; flex-shrink: 0; display: flex; flex-direction: column">
                        <div style="height: 10px; flex-shrink: 0; border-left: 1px solid blue; border-bottom: 1px solid blue"></div>
                        <div v-if="i+1<root.Children.length" style="flex-grow: 1; border-left: 1px solid blue"></div>
                    </div>
                    <TreeVertex :root="child"/>
                </div>

        </div>
    </div>
</template>

<script>

import { mapActions, mapState, mapGetters } from 'vuex';

export default {
    name: "TreeVertex",
    data: function()
    {
        return {
            opened: false,
        }
    },
    props:
    {
        root: {},
        noParent:
        {default: false}
    },
    methods:
    {
        ...mapActions(['GET_TREE_LEVEL']),
        expand: function()
        {
            if(this.root.Children!="loading")
            {
                if(this.opened) this.opened=false;
                else
                {
                    if(!this.root.Children) this.GET_TREE_LEVEL({root: this.root});
                    this.opened=true;
                }
            }
        }
    }
}
</script>

<style>

</style>
