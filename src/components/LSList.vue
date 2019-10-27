<template>
<div>
    <table class="table">
        <tbody>
            <tr v-for="equipment in state"
                :style="{'background-color': (equipment.WorkState) ? '#ccffcc' : '#ffcccc'}">
                <td>{{ equipment.TypeName }}</td>
                <td>{{ equipment.TariffValue }}</td>
            </tr>
        </tbody>
    </table>
    
    <table class="table table-borderless">
        <tbody>
            <template v-for="LS in list">
                
                <tr @click="showObject(LS.Object)" class="border-top">
                    <td>{{ LS.Number }}</td>
                    <td>{{ LS.Name }}</td>
                    <td class="text-right">{{ LS.Balance }}</td>
                </tr>
                
                <tr v-if="LS.IndividualState">
                <td colspan="3">
                    <table class="table">
                        <tbody>
                        <tr v-for="equipment in LS.IndividualState"
                            class="border-top"
                            :style="{'background-color': (equipment.WorkState) ? '#ccffcc' : '#ffcccc'}">
                            <td>{{ equipment.TypeName }}</td>
                            <td>{{ equipment.TariffValue }}</td>
                        </tr>
                        </tbody>
                    </table>
                </td>
                </tr>
                
            </template>
        </tbody>
    </table>
</div>
</template>

<script>

export default {
    props: ["FirmID", "ObjectID", "addPanel", "showObject", "list", "state"],
    data: function()
    {
        console.log(this.list);
        
        return {};
    }
}
</script>
