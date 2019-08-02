<template>
    <div>
        <div class="d-flex">
            <div style="width: 30px" class="flex-grow-0 d-flex flex-column align-items-start">
                <div v-if="root.ChildrenQnt == 0" style="width: 20px; height: 10px" class="flex-grow-0 border-bottom border-primary"/>
                <template v-else>
                    <div style="width: 20px; height: 20px" class="flex-grow-0 d-flex justify-content-center align-items-center border border-primary rounded-circle text-primary" @click="expand">

                        <font-awesome-icon v-if="root.Children === null" icon="spinner" pulse/>

                        <font-awesome-icon v-else-if="!opened || root.Children.DMF_ERROR" icon="plus"/>

                        <font-awesome-icon v-else icon="minus"/>

                    </div>
                    <div v-show="opened && root.Children !== null && !root.Children.DMF_ERROR" style="padding-left: 10px">
                        <div style="height: 100%" class="border-left border-primary"/>
                    </div>
                </template>
            </div>
            <div @click="showObject" style="padding-bottom: 10px" class="flex-grow-0">{{Name}}</div>
            <div v-if="root.LSQnt" class="flex-grow-0 pl-2">
                <button @click="showLS" class="btn btn-sm btn-primary p-0" style="font-size: inherit">ЛС({{ root.LSQnt }})</button>
            </div>
        </div>
        <div v-if="opened && root.Children !== null && !root.Children.DMF_ERROR" style="padding-left: 10px">

            <div v-for="(child, i) in root.Children" class="d-flex">
                <div style="width: 10px" class="flex-grow-0 d-flex flex-column">
                    <div style="height: 10px" class="flex-grow-0 border-left border-bottom border-primary"></div>
                    <div v-if="i+1<Object.keys(root.Children).length" class="border-left border-primary"></div>
                </div>
                <TreeVertex :FirmID="FirmID" :ObjectID="child.ObjectID" :Name="child.Name" :addPanel="addPanel"/>
            </div>

        </div>
        <div v-if="root.Children && root.Children.DMF_ERROR" class="d-flex">
            <div class="flex-grow-0 alert alert-danger p-1">{{ root.Children.message }}</div>
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
        ...mapActions(['LOAD_TREE_LEVEL', 'LOAD_LS_LIST']),
        expand: function()
        {
            if(this.root.Children !== null)
            {                
                if(this.opened)
                {
                    if(this.root.Children.DMF_ERROR)
                    {
                        this.LOAD_TREE_LEVEL({FirmID: this.FirmID, ObjectID: this.ObjectID});
                    }
                    else this.opened=false;
                }
                else
                {
                    if(!this.root.Children) this.LOAD_TREE_LEVEL({FirmID: this.FirmID, ObjectID: this.ObjectID});
                    this.opened=true;
                }
            }
        },
        showLS: function()
        {
            let FirmID = this.FirmID, ObjectID = this.ObjectID;

            this.addPanel("LSList", this.root.Name, {FirmID: this.FirmID, ObjectID: this.ObjectID});
        },
        showObject: function()
        {
            this.addPanel("Object", this.root.Name, {FirmID: this.FirmID, ObjectID: this.ObjectID, ObjectType: this.root.Type});
        }
    }
}
</script>

<style>

</style>
