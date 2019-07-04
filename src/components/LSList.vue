<template>
    <div>
        <div v-for="(value, key) in info">{{key}}:{{value}}</div>
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["info"],
    computed:
    {
        List: function()
        {

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
