<template>
    <div>
        <template v-if="List!='loading'">
            <div v-for="LS in List" style="border: 1px solid black">
                {{LS}}
            </div>
        </template>
        <div v-else style="display: flex; justify-content: center; align-items: center">
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

            if(root[Firm] && this.root[Firm].Objects && root[Firm].Objects[ID] && root[Firm].Objects[ID].LSlist)
            {
                console.log("found");

                return root[Firm].Objects[ID].LSlist;
            }
            else
            {
                console.log("called");
                this.GET_LS_LIST({FirmID: Firm, ObjectID: ID});
                return "loading";
            }
        }
    },
    methods:
    {
        ...mapActions(['GET_LS_LIST']),
    }
}
</script>

<style>

</style>
