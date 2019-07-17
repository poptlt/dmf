<template>
    <div>
        <b-card no-body>
            <b-card-header @click="collapse(propsID)">Реквизиты</b-card-header>
            <b-collapse :id="propsID" visible :accordion="accordionID">
                <b-card-body class="p-0">
                    <table v-if="props" class="table table-hover">
                        <tbody>
                            <tr v-for="item in props">
                                <td>{{ item.PropName }}</td>
                                <td>{{ item.Value }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <center v-else class="text-primary"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card no-body>
            <b-card-header @click="collapse(calcParamsID)">Параметры расчетов</b-card-header>
            <b-collapse :id="calcParamsID" visible :accordion="accordionID">
                <b-card-body class="p-0">
                    <table v-if="calcParams" class="table table-hover">
                        <tbody>
                            <tr v-for="item in calcParams">
                                <td>{{ item.ParamName }}</td>
                                <td>{{ item.Value }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <center v-else class="text-primary"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card v-if="root.Type == 'Firm'" no-body>
            <b-card-header @click="collapse(tariffsID)">Тарифы</b-card-header>
            <b-collapse :id="tariffsID" visible :accordion="accordionID">
                <b-card-body class="p-0">
                    <table v-if="tariffs" class="table table-hover">
                        <tbody>
                            <tr v-for="item in tariffs">
                                <td>{{ item.TariffName }}</td>
                                <td class="text-right">{{ item.Value }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <center v-else class="text-primary"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
                </b-card-body>
            </b-collapse>
        </b-card>

        <b-card v-if="root.Type == 'Firm'" no-body>
            <b-card-header @click="collapse(bankAccountsID)">Расчётные счета</b-card-header>
            <b-collapse :id="bankAccountsID" visible :accordion="accordionID">
                <b-card-body class="p-0">
                    <div v-if="bankAccounts" class="p-2">
                        <b-card v-for="account in bankAccounts" no-body>
                            <b-card-header @click="collapse(bankAccountsID+account.BankAccountID)">{{ account.BankAccountNumber }}</b-card-header>
                            <b-collapse :id="bankAccountsID+account.BankAccountID" visible :accordion="bankAccountsID+'accordion'">
                                <b-card-body class="p-0">
                                    <div>Неопознанные платежи:</div>
                                    <table class="table table-hover">
                                        <tbody>
                                            <tr v-for="payment in account.FailPayments">
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
                                </b-card-body>
                            </b-collapse>
                        </b-card>
                    </div>
                    <center v-else class="text-primary"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
                </b-card-body>
            </b-collapse>
        </b-card>

        <!--<b-card v-if="root.Type == 'LS'" no-body>
            <b-card-header @click="collapse(turnoverID)">Тарифы</b-card-header>
            <b-collapse :id="turnoverID" visible :accordion="accordionID">
                <b-card-body class="p-0">
                    <table v-if="turnover" class="table table-hover">
                        <tbody>
                            <tr v-for="item in turnover">
                                <td></td>
                                <td class="text-right"></td>
                            </tr>
                        </tbody>
                    </table>
                    <center v-else class="text-primary"><font-awesome-icon icon="spinner" size="3x" pulse/></center>
                </b-card-body>
            </b-collapse>
        </b-card>-->
    </div>
</template>

<script>

import { mapActions, mapState } from 'vuex';

export default {
    props: ["info"],
    data: function()
    {
        return {
            accordionID: this.randomID(),
            propsID: this.randomID(),
            calcParamsID: this.randomID(),
            tariffsID: this.randomID(),
            bankAccountsID: this.randomID()
        }
    },
    computed:
    {
        ...mapState(["Objects"]),
        root: function()
        {
            let FirmID = this.info.FirmID, ObjectID = this.info.ObjectID;

            return this.Objects[FirmID][ObjectID];
        },
        props: function()
        {
            console.log(this.root);

            if(this.root.Props === undefined) this.reload();

            return this.root.Props;
        },
        calcParams: function()
        {
            if(this.root.CalcParams === undefined) this.reload();

            return this.root.CalcParams;
        },
        tariffs: function()
        {
            if(this.root.Tariffs === undefined) this.reload();

            return this.root.Tariffs;
        },
        bankAccounts: function()
        {
            if(this.root.BankAccounts === undefined) this.reload();

            return this.root.BankAccounts;
        }
    },
    methods:
    {
        ...mapActions(['LOAD_OBJECT']),
        randomID: function()
        {
            return "id"+(""+Math.random()).substring(2);
        },
        collapse: function(ID)
        {
            this.$root.$emit('bv::toggle::collapse', ID);
        },
        reload: function()
        {
            this.LOAD_OBJECT({FirmID: this.info.FirmID, ObjectID: this.info.ObjectID, refresh: true});
        }
    }
}
</script>

<style>

</style>
