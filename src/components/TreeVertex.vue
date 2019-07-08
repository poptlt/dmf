<template>
    <div>
        <div style="display: flex">
            <div style="width: 30px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-start">
                <div v-if="root.ChildrenQnt == 0" style="width: 20px; height: 10px; border-bottom: 1px solid blue"/>
                <template v-else>

                    <div style="width: 20px; height: 20px; border: 1px solid blue; border-radius: 10px; display: flex; justify-content: center; align-items: center" @click="expand">

                        <v-icon v-if="!opened" size="18" style="color: blue">add</v-icon>

                        <v-icon v-else-if="opened && root.Children !== null" size="18" style="color: blue">remove</v-icon>

                        <v-progress-circular v-else :size="12" :width="2" indeterminate style="color: blue"></v-progress-circular>

                    </div>
                    <div v-show="opened && root.Children !== null" style="flex-grow: 1; padding-left: 10px">
                        <div style="height: 100%; border-left: 1px solid blue"/>
                    </div>
                </template>
            </div>
            <div @click="showObject" style="font-size: 18px; padding-bottom: 10px">{{Name}}</div>
            <div v-if="root.LSQnt" style="font-size: 18px">
                <div @click="showLS" style="border-radius: 5px; background-color: blue; color: white; padding-left: 3px; padding-right: 3px; margin-left: 3px">ЛС({{ root.LSQnt }})</div>
            </div>
        </div>

        <div v-if="opened && root.Children !== null" style="padding-left: 10px">

                <div v-for="(child, i) in root.Children" style="display: flex">
                    <div style="width: 10px; flex-shrink: 0; display: flex; flex-direction: column">
                        <div style="height: 10px; flex-shrink: 0; border-left: 1px solid blue; border-bottom: 1px solid blue"></div>
                        <div v-if="i+1<Object.keys(root.Children).length" style="flex-grow: 1; border-left: 1px solid blue"></div>
                    </div>
                    <TreeVertex :FirmID="FirmID" :ObjectID="child.ObjectID" :Name="child.Name" :addPanel="addPanel"/>
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
    computed:
    {
        ...mapState(["Objects"]),
        root: function()
        {
            return this.Objects[this.FirmID][this.ObjectID];
        }
    },
    props: ["addPanel", "FirmID", "ObjectID", "Name"],
    methods:
    {
        ...mapActions(['LOAD_TREE_LEVEL', 'GET_LS_LIST']),
        expand: function()
        {
            if(this.root.Children !== null)
            {                
                if(this.opened) this.opened=false;
                else
                {
                    if(!this.root.Children) this.LOAD_TREE_LEVEL({FirmID: this.FirmID, ObjectID: this.ObjectID});
                    this.opened=true;
                }
            }
        },
        showLS: function()
        {
            this.addPanel("LSList", this.root.Name, {FirmID: this.FirmID, ObjectID: this.ObjectID});

            //this.GET_LS_LIST({FirmID: this.root.FirmID, ObjectID: this.root.ID});
        },
        showObject: function()
        {
            this.addPanel("Object", this.root.Name, {FirmID: this.FirmID, ObjectID: this.ObjectID});
        }
    }
}
</script>

<style>

</style>
