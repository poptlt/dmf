<template>
    <div v-if="List !== undefined">
        {{List}}
        <!--<div v-if="List!='loading'">
            <div v-for="LS in List">
                
            </div>
        </div>
        <div v-else style="display: flex; justify-content: center; align-items: center">
            <v-progress-circular :size="50" indeterminate style="color: blue"></v-progress-circular>
        </div>-->
        <!--<div style="display: flex; justify-content: center; align-items: center">
            <v-progress-circular :size="50" indeterminate style="color: blue"></v-progress-circular>
        </div>-->
    </div>

</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["info"],
    computed:
    {
        ...mapState(["Objects"]),
        root: function()
        {
            let FirmID = this.info.FirmID, ObjectID = this.info.ObjectID;
            
            console.log(FirmID);
            console.log(ObjectID);
            
            return (ObjectID) ? this.Objects[FirmID].Objects[ObjectID] : this.Objects[FirmID];
        },
        List: function()
        {
            if(this.root.LS === undefined)
            {
                this.LOAD_LS_LIST({FirmID: this.info.FirmID, ObjectID: this.info.ObjectID});
            }
            
            console.log(this.root.LS);
            
            return this.root.LS;
        },

    },
    methods:
    {
        ...mapActions(['LOAD_LS_LIST']),
    }
}
</script>

<style>

</style>
