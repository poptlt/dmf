<template>
<div>
    <table class="table">
        <template v-for="(item, i) in data">
            <tr :style="{'background-color': (item.State) ? 'PaleGreen' : 'LightCoral'}">
                <td>{{ item.ComplectName }}</td>
                <td>{{ item.TypeName }}</td>
                <td class="px-0">
                    <button @click="show(i)"
                            class="btn btn-link btn-sm">
                        <font-awesome-icon :icon="(opened[i]) ? 'chevron-up' : 'chevron-down'"/>
                    </button>
                </td>
            </tr>
            <tr v-if="opened[i]">
                <td colspan="3">
                    <div>
                        Дата установки: {{ dateForClient(new Date(Date.parse(item.DateInstall)), 'day') }}
                    </div>
                    <div>
                        Установлено на <a href="#">{{ item.ObjectInstallName }}</a>
                    </div>
                    <template v-if="item.DateState !== null">
                        <div>
                            Дата {{ (item.State) ? 'включения' : 'выключения' }}:
                            {{ dateForClient(new Date(Date.parse(item.DateState)), 'day') }}
                        </div>
                        <div>
                            {{ (item.State) ? 'Включено' : 'Выключено' }} на
                            <a href="#">{{ item.ObjectStateName }}</a>
                        </div>
                    </template>
                </td>
            </tr>
        </template>
    </table>
</div>
</template>

<script>

import Vue from 'vue';

export default {
    props: ["data"],
    data: function()
    {
        return {

            opened: []
        }
    },
    methods:
    {
        show: function(i)
        {
            Vue.set(this.opened, i, (this.opened[i]) ? false : true);
        },
    }
}
</script>

<style>

</style>
