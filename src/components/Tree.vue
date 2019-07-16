<template>

    <div style="padding: 10px">

        <!--<div class="hidden-sm-and-up">extra small</div>
        <div class="hidden-xs-only hidden-md-and-up">small</div>
        <div class="hidden-sm-and-down hidden-lg-and-up">middle</div>
        <div class="hidden-md-and-down hidden-xl-only">large</div>
        <div class="hidden-lg-and-down">extra large</div>-->

        <!--<div class="d-block d-sm-none">extra small</div>
        <div class="d-none d-sm-block d-md-none">small</div>
        <div class="d-none d-md-block d-lg-none">middle</div>
        <div class="d-none d-lg-block d-xl-none">large</div>
        <div class="d-none d-xl-block">extra large</div>-->

        <template v-if="roots !== null">
            <template v-if="!FirmID">
                <TreeVertex v-for="(val, FirmID) in roots" :addPanel="addPanel" :FirmID="FirmID" :ObjectID="FirmID" :Name="roots[FirmID][FirmID].Name"/>
            </template>
            <template v-else>
                <TreeVertex :addPanel="addPanel" :FirmID="FirmID" :ObjectID="ObjectID" :Name="roots[FirmID][ObjectID].Name"/>
            </template>
        </template>
        <center v-else class="text-primary"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
    </div>

</template>

<script>

import TreeVertex from './TreeVertex.vue';

import { mapState } from 'vuex';

export default {
    components: {TreeVertex},
    props: ["addPanel", "FirmID", "ObjectID"],
    computed:
    {
        ...mapState({roots: "Objects"})
    }
}
</script>

<style>

</style>
