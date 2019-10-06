<template>
    <table v-else class="table table-hover">
        <tbody>
            <tr v-for="LS in list" @click="showObject(LS.LSID, LS.LSName)">
                <td>{{ LS.Number }}</td>
                <td>{{ LS.AdressAdd }}</td>
                <td class="text-right">{{ LS.Balance }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script>

export default {
    props: ["FirmID", "ObjectID", "addPanel", "list"],
    methods:
    {
        showLS: function(ID, name)
        {
            this.addPanel("Object", name, {FirmID: this.FirmID, ObjectID: ID, Type: "LS"});
        }
    }
}
</script>
