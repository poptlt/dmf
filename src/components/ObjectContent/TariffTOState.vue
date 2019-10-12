<template>
<div>
    <table class="table">
        <template v-for="(tariff, i) in data">
            <tr>
                <td>{{ dateForClient(new Date(Date.parse(tariff.Date)), 'month') }}</td>
                <td>{{ tariff.TariffName }} 
                    <a v-if="tariff.ObjectID != ObjectID"
                       href="#"
                       @click="showObject(tariff.ObjectID, tariff.ObjectName)">
                        ( {{ tariff.ObjectName }} )
                    </a>
                </td>
                <td v-if="remove" class="p-1" align="right">
                    <button @click="remove(tariff.Date, tariff.TariffID)"
                            class="btn btn-danger btn-sm">
                        <font-awesome-icon icon="times"/>
                    </button>
                </td>
            </tr>
            <tr>
                <td :colspan="(remove) ? 3 : 2" class="p-0 pl-4">
                    <table class="table table-bordered m-0">
                        <tr v-for="equipment in tariff.Value">
                            <td>{{ equipment.TypeName }}</td>
                            <td>{{ equipment.Value }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </template>
    </table>
</div>
</template>

<script>

export default {
    props: ["data", "remove", "FirmID", "ObjectID"],
    methods:
    {
        showObject: function(ID, Name, Type)
        {
            //this.addPanel("Object", Name, {FirmID: this.FirmID, ObjectID: ID, Name: Name, Type: Type});
        }
    }
}
</script>

<style>

</style>
