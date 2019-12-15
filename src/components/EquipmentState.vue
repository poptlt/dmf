<template>
<!--<table class="table">
    <template v-for="complect in data">
    <tr :style="{'background-color': (complect.Value) ? ((complect.State ? '#ccffcc' : '#ffcccc')) : 'WhiteSmoke'}">
        <td>{{ complect.Value.Name }}</td>
        <td>-</td>
        <td class="px-0">
            <button
                    class="btn btn-link btn-sm">
                <font-awesome-icon :icon='chevron-down'/>
            </button>
        </td>
    </tr>
    </template>
</table>-->

<script>
export default {
    props: ["data"],
    data ()
    {
        console.log(this.data);

        /*this.data.forEach((item) => {

            if(item.Value)
            {

            }
        });*/

        return { };
    },
    components: {
    }
}
</script>
