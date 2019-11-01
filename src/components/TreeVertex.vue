<template>
    <div>
        <div class="d-flex">
            <div style="width: 30px" class="flex-grow-0 flex-shrink-0 d-flex flex-column align-items-start">
                <div v-if="!NodesQnt" style="width: 20px; height: 10px" class="flex-grow-0 border-bottom border-primary"/>
                <template v-else>
                    <div style="width: 20px; height: 20px" class="flex-grow-0 d-flex justify-content-center align-items-center border border-primary rounded-circle text-primary" @click="expand">

                        <font-awesome-icon v-if="children === null" icon="spinner" pulse/>

                        <font-awesome-icon v-else-if="!opened || (children && children.DMF_ERROR)" icon="plus"/>

                        <font-awesome-icon v-else icon="minus"/>

                    </div>
                    <div v-if="opened && children && !children.DMF_ERROR" style="padding-left: 10px">
                        <div style="height: 100%" class="border-left border-primary"/>
                    </div>
                </template>
            </div>
            
            <div @click="showObject(object)" style="padding-bottom: 10px; cursor: pointer" class="flex-grow-0">{{Name}}</div>
            <div v-if="LSQnt" class="flex-grow-0 pl-2">
                <button @click="showLS" class="btn btn-sm btn-primary py-0 px-1" style="font-size: inherit">
                    {{ LSQnt }}
                    <span v-if="LSDiffHard" class="badge badge-pill badge-secondary ml-1">{{ LSDiffHard }}</span>
                    
                    <span v-if="LSDiffWork" class="badge badge-pill badge-success ml-1">{{ LSDiffWork }}</span>
                    
                    <span v-if="LSDiffTariff" class="badge badge-pill badge-warning ml-1">{{ LSDiffTariff }}</span>
                </button>
            </div>
        </div>

        <div v-if="opened && children && !children.DMF_ERROR" style="padding-left: 10px">

            <div v-for="(child, i) in children" class="d-flex">
                
                <div style="width: 10px"
                     class="flex-grow-0 flex-shrink-0 d-flex flex-column">
                    
                    <div style="height: 10px"
                         class="flex-grow-0 border-left border-bottom border-primary"/>
                    
                    <div v-if="i+1<children.length" class="border-left border-primary"/>
                </div>
                
                <TreeVertex :object="child.Object" v-bind="child" :addPanel="addPanel" :showObject="showObject"/>
            </div>

        </div>
        <div v-if="children && children.DMF_ERROR" class="d-flex">
            <div class="flex-grow-0 alert alert-danger p-1">{{ children.message }}</div>
        </div>
    </div>
</template>

<script>

import { mapActions } from 'vuex';

export default {
    name: "TreeVertex",
    props: ["addPanel", "showObject", "Name", "LSQnt", "NodesQnt", "object", 
            "LSDiffHard", "LSDiffWork", "LSDiffTariff"],
    data: function()
    {        
        return {
            opened: false,
        }
    },
    computed:
    {
        children: function()
        {
            return this.vuexGet("Objects", this.object.FirmID, this.object.ObjectID, "TreeLevel");
        },
    },
    methods:
    {
        ...mapActions(['LOAD_DATA']),
        expand: function()
        {
            if(this.children !== null)
            {                
                if(this.opened)
                {
                    if(this.children.DMF_ERROR)
                    {
                        this.LOAD_DATA([{func: "TreeLevel", FirmID: this.object.FirmID, ObjectID: this.object.ObjectID}]);
                    }
                    else this.opened=false;
                }
                else
                {
                    if(!this.children) this.LOAD_DATA([{func: "TreeLevel", FirmID: this.object.FirmID, ObjectID: this.object.ObjectID}]);
                    this.opened=true;
                }
            }
        },
        showLS: function()
        {
            this.addPanel("LSList", this.object.Name, {FirmID: this.object.FirmID, ObjectID: this.object.ObjectID});
        }
    }
}
</script>

<style>

</style>
