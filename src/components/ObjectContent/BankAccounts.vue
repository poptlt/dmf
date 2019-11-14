<template>
<div>
    <center>
        <button @click="loadPaymentFile"
                class="border btn btn-light btn-sm m-2">
            Загрузить платежи из файла
        </button>
    </center>
    
    <div v-for="(account, i) in data" class="border rounded m-2">

        <Tab :accordionID="accordionID" :label="account.BankAccountNumber" :visible="i==0">

            <center class="p-2 font-weight-bold">Неопознанные платежи:</center>
            <table class="table table-hover">
                <tbody>
                    <tr v-for="payment in account.FailPayments" @click="showDocument(payment.Doc)">
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
        console.log(this.data);
        return { accordionID: "id"+(""+Math.random()).substring(2) }
    },
    methods:
    {
        showDocument: function({DocID, Name, Object})
        {
            this.addPanel("BankPayment", Name, {DocumentID: DocID, FirmID: Object.FirmID, ObjectID: Object.ObjectID});
        },
        loadPaymentFile: function()
        {
            this.addPanel("PaymentFile", "Загрузить платежи из файла", {});
        }
    }
}
</script>

<style>

</style>
