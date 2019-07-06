<template>
    <div v-if="List!=null">
        <!--<div v-if="List!='loading'">
            <div v-for="LS in List">
                {{LS}}
            </div>
        </div>
        <div v-else style="display: flex; justify-content: center; align-items: center">
            <v-progress-circular :size="50" indeterminate style="color: blue"></v-progress-circular>
        </div>-->
        <div style="display: flex; justify-content: center; align-items: center">
            <v-progress-circular :size="50" indeterminate style="color: blue"></v-progress-circular>
        </div>
    </div>

</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["info"],
    computed:
    {
        ...mapState({root: "Objects"}),
        List: function()
        {
            let Firm = this.info.FirmID, ID = this.info.ObjectID, root=this.root;

            if(root[Firm].Objects[ID] && root[Firm].Objects[ID].LSList)
            {
                console.log("found");

                if(root[Firm].Objects[ID].LSList == "loading") console.log("loading");
                else console.log(root[Firm].Objects[ID].LSList);

                return root[Firm].Objects[ID].LSList;
            }
            else
            {
                console.log("called");

                console.log(null);

                this.GET_LS_LIST({FirmID: Firm, ObjectID: ID});
                return null;
            }
        },

    },
    methods:
    {
        ...mapActions(['GET_LS_LIST']),
    }
}
</script>

<style>

</style>
