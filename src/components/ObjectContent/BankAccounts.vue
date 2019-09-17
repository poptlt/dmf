<template>
    <div v-if="data !== undefined">
        <center v-if="!data" class="text-primary p-2"><font-awesome-icon icon="spinner" size="3x" pulse/></center>

        <div v-else-if="data.DMF_ERROR" class="alert alert-danger">{{ data.message }}</div>

        <div v-for="(account, i) in data" class="border rounded m-2">

            <Tab :accordionID="accordionID" :label="account.BankAccountNumber" :visible="i==0">

                <center class="p-2 font-weight-bold">Неопознанные платежи:</center>
                <table class="table table-hover">
                    <tbody>
                        <tr v-for="payment in account.FailPayments" @click="showDocument(payment.DocID)">
                            <td>
                                <div class="d-flex flex-wrap">
                                    <div class="flex-grow-0 p-2">{{ payment.Date }}</div>
                                    <div class="flex-grow-0 p-2">№ {{ payment.Number }}</div>
                                    <div class="flex-grow-0 p-2">{{ payment.Summ }} руб.</div>
                                    <div class="flex-grow-0 p-2">{{ payment.Text }}</div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </Tab>

        </div>
    </div>

</template>

<script>

import Tab from './Tab.vue';

export default {
    components: {Tab},
    props: ["data", "addPanel"],
    data: function()
    {
        return { accordionID: "id"+(""+Math.random()).substring(2) }
    },
    methods:
    {
        showDocument: function(ID)
        {
            this.addPanel("Document", "", {DocumentID: ID});
        }
    }
}
</script>

<style>

</style>
