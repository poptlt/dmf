<template>
    <div>
        <div style="display: flex">
            <div style="width: 30px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-start">
                <div v-if="root.ChildrenQnt==0" style="width: 20px; height: 10px; border-bottom: 1px solid blue"/>
                <template v-else>
                    <v-icon size="18" color="blue" style="border: 1px solid blue; border-radius: 10px;" @click="expand">add</v-icon>
                    <div style="flex-grow: 1; padding-left: 10px">
                        <div style="height: 100%; border-left: 1px solid blue"/>
                    </div>
                </template>
            </div>
            <div style="font-size: 18px; padding-bottom: 5px">{{root.Name}}</div>
        </div>
        <div v-if="root.Children=='loading'">loading</div>
        <div v-if="root.ChildrenQnt>0 && root.Children!='loading' && root.Children!=null" style="padding-left: 10px">
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

                    console.log("sdhtggh");
                }
            }
        }
    }
}
</script>

<style>

</style>
