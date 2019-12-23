<template>
<div>
    <template v-for="(period, i) in history">
        <center v-if="period.Date != '-'"
                class="font-weight-bold">
            {{ dateForClient(period.Date, 'day') }}
        </center>
        <EquipmentState :data="period.State"
                        :editable="i==history.length-1"
                        :FirmID="FirmID"
                        :ObjectID="ObjectID"
                        :tariffs="tariffs"
                        :date="period.Date"/>
    </template>
</div>
</template>

<script>

import EquipmentState from './EquipmentState.vue';

export default {
    props: ["FirmID", "ObjectID", "history", "tariffs", "kits"],
    components:
    {
        EquipmentState
    },
    data () {
        console.log(this.history);

        return {};
    },
}
</script>

<style>

</style>
