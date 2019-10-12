<template>
<table class="table table-hover">
    <tbody>
        <tr v-for="LS in list" @click="showObject(LS.Object)">
            <td>{{ LS.Number }}</td>
            <td>{{ LS.Name }}</td>
            <td class="text-right">{{ LS.Balance }}</td>
        </tr>
    </tbody>
</table>
</template>

<script>

export default {
    props: ["FirmID", "ObjectID", "addPanel", "showObject", "list"],
}
</script>
